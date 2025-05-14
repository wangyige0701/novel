import 'reflect-metadata';
import sqlstring from 'sqlstring';
import {
	Arrayable,
	type ElementOf,
	type Fn,
	isArray,
	isBoolean,
	isDef,
	isNumber,
	isObject,
	isString,
	isUndef,
	toArray,
} from '@wang-yige/utils';
import type {
	ColumnMetadata,
	ColumnOptions,
	SelectFormatOptions,
	TableId,
	TableOptions,
} from '@/@types/common/database';
import DatabaseConfig, { Type } from '@/config/database';
import SQLite from './SQLite';
import { BaseTable, DisabledFields, SelectConditionArrays, SelectConditionKeys } from './base';
import { columnSql, parseConditions, parseValue, stringifyValue, updateTableSql } from './utils';

const TABLE_FIELD = Symbol.for('database#tableField');
const TABLE_ID = Symbol.for('database#tableId');
const instanceCache = new WeakMap<any, any>();

export { Type };

/**
 * 声明表，如果没有声明数据库，则默认为 `main` 主数据库
 */
export function Table(name: string, _description?: string): Fn<[target: any], void>;
export function Table(options: TableOptions, _description?: string): Fn<[target: any], void>;
export function Table(options: string | TableOptions, _description?: string) {
	if (isString(options)) {
		options = {
			name: options,
		};
	}
	return function (target: any) {
		if (!(target.prototype instanceof BaseTable)) {
			throw new Error(`数据表类必须继承于 ${BaseTable.name}`);
		}
		const { name, database = 'main', test = false, disabled = false, indexs = [] } = options;
		const columns = (Reflect.getMetadata(TABLE_FIELD, target.prototype) || []) as ColumnMetadata;
		/** 手动执行数据库开关状态，为 true 则不能自动处理数据库开关 */
		let selfDatabaseStatus = false;
		// 新建表
		/** 通过 ID 装饰器注册的字段（经过转义），用于作为查询的主键 id */
		let idColumnName: string;
		/** 记录字段数据 */
		const keys = new Array<{
			name: string;
			id: boolean;
			key: string;
			type: Type;
			hasDefault: boolean;
		}>();
		/** 转义后的表名 */
		const tableName = sqlstring.escapeId(name);
		const fields = columns.map(column => {
			const columnName = sqlstring.escapeId(column.options.name!);
			const length = keys.push({
				name: column.options.name!,
				key: column.key,
				id: false,
				type: column.options.type!,
				hasDefault: isDef(column.options.default),
			});
			if (column.id) {
				idColumnName = columnName!;
				keys[length - 1].id = true;
				return `${columnName} INTEGER PRIMARY KEY AUTOINCREMENT`;
			} else {
				// 记录字段
				return columnSql(column.options);
			}
		});
		/** 获取数据表创建的 sql，创建字段相同，可以传入表名 */
		const sql = (useTableName: string = tableName) => {
			return [`CREATE TABLE IF NOT EXISTS ${useTableName} (${fields.join(',')});`];
		};
		const config = {
			enumerable: false,
			writable: false,
			configurable: false,
		} as PropertyDescriptor;
		/** 获取当前数据库对应的 sqlite 实例 */
		const getSqlite = (): InstanceType<typeof SQLite> => {
			if (!SQLite.usable) {
				// @ts-expect-error
				return;
			}
			const config = DatabaseConfig[database];
			return new SQLite(config.name, config.path);
		};
		/** 执行 sql 语句 */
		const useSql = async (sqlite: SQLite, executeSql: string | string[], selectSql?: string) => {
			if (!selfDatabaseStatus) {
				await sqlite.open();
			}
			let result;
			try {
				await sqlite.beginTransaction();
				if ((isString(executeSql) && executeSql) || (isArray(executeSql) && executeSql.length)) {
					await sqlite.execute(executeSql);
				}
				if (selectSql) {
					result = await sqlite.select(selectSql);
				}
				await sqlite.commitTransaction();
				if (!selfDatabaseStatus) {
					await sqlite.close();
				}
			} catch (error) {
				await sqlite.rollbackTransaction();
			}
			return result;
		};
		function _inject(t: object, key: string, value: any) {
			Object.defineProperty(t, key, { ...config, value });
		}
		// sqlite 实例注入
		_inject(target, 'sqlite', getSqlite());
		// 表名属性注入
		_inject(target, 'name', tableName);
		// 未转义表名注入
		_inject(target, 'oname', name);
		// 预执行的 sql 语句注入
		_inject(target.prototype, '__sql', sql().join('\n'));
		// 数据库信息注入
		_inject(target.prototype, '__info', () => {
			const config = DatabaseConfig[database];
			return {
				name: config.name,
				path: config.path,
				table: name,
			};
		});
		// 数据表创建执行函数注入
		_inject(target.prototype, '__create', async () => {
			if (disabled) {
				console.log(`表 ${name} 已禁用，取消执行`);
				// 禁用状态
				return false;
			}
			if (test && import.meta.env.PROD) {
				// 测试表，生产环境不创建
				return false;
			}
			const sqlite = getSqlite();
			// 如果更新表，则不继续执行
			let update;
			if ((update = await updateTableSql(sqlite, name, columns, indexs, sql))) {
				console.log(`数据表 ${name} 更新成功：\n${update.join('\n')}`);
				return false;
			}
			// 执行 __create 方法需要关闭手动数据库操作
			selfDatabaseStatus = false;
			await useSql(sqlite, sql());
		});
		// 单例缓存
		return new Proxy(class {}, {
			construct(_, ...args: any[]) {
				if (instanceCache.has(target)) {
					return instanceCache.get(target);
				}
				const instance = new target(...args);
				// 注入基础方法
				_inject(instance, 'open', async () => {
					selfDatabaseStatus = true;
					await getSqlite().open();
					return instance;
				});
				_inject(instance, 'close', async () => {
					if (!selfDatabaseStatus) {
						throw new Error('数据库未手动打开');
					}
					selfDatabaseStatus = false;
					await getSqlite().close();
				});
				_inject(instance, 'insert', async (fields: object) => {
					const _insert = async (field: object) => {
						// 过滤掉主键字段
						const list = keys.filter(item => !item.id);
						const datas = {} as Record<string, any>;
						// 表字段和对应属性不一定相同，需要分开处理
						for (const { name, key, type, hasDefault } of list) {
							// 解析输入值，进行格式化
							if (key in field) {
								const value = field[key as keyof typeof field];
								datas[sqlstring.escapeId(name)] = stringifyValue(key, value, type, hasDefault);
								continue;
							}
							datas[sqlstring.escapeId(name)] = stringifyValue(key, void 0, type, hasDefault);
						}
						const columnKeys = Object.keys(datas);
						const columnValues = Object.values(datas);
						const _sql = `INSERT INTO ${tableName} (${columnKeys.join(',')}) VALUES (?);`;
						const lastRowtId = await useSql(
							getSqlite(),
							[sqlstring.format(_sql, [columnValues])],
							'SELECT last_insert_rowid();',
						);
						return { lastRowtId: lastRowtId[0]?.['last_insert_rowid()'] };
					};
					if (isArray(fields)) {
						await instance.open();
						const sqlite = getSqlite();
						const results = [];
						try {
							await sqlite.beginTransaction();
							for (const field of fields) {
								results.push(await _insert(field));
							}
							await sqlite.commitTransaction();
						} catch (error) {
							await sqlite.rollbackTransaction();
						}
						await instance.close();
						return results;
					}
					return _insert(fields);
				});
				_inject(instance, 'update', async (id: TableId, fields: object) => {
					if (!idColumnName) {
						throw new Error('使用 `update` 方法时，必须使用 ID 装饰器注册主键字段');
					}
					if (!isString(id) && !isNumber(id)) {
						throw new Error(`${idColumnName} 必须是字符串或数字`);
					}
					const datas = { ...fields } as Record<string, any>;
					for (const name in datas) {
						const target = keys.find(item => item.name === name);
						if (!target) {
							throw new Error(`字段 ${name} 不存在`);
						}
						const key = target.key;
						const value = datas[name];
						if (isUndef(value)) {
							datas[key] = null;
							continue;
						}
						datas[key] = stringifyValue(key, value, target.type, target.hasDefault);
					}
					const _sql = `UPDATE ${tableName} SET ? WHERE ${idColumnName} IN (?);`;
					const affectedRows = await useSql(
						getSqlite(),
						sqlstring.format(_sql, [datas, toArray(id)]),
						'SELECT changes();',
					);
					return { affectedRows: affectedRows[0]?.['changes()'] };
				});
				_inject(instance, 'delete', async (id: TableId) => {
					if (!idColumnName) {
						throw new Error('使用 `delete` 方法时，必须使用 ID 装饰器注册主键字段');
					}
					if (!isString(id) && !isNumber(id)) {
						throw new Error(`${idColumnName} 必须是字符串或数字`);
					}
					const _sql = `DELETE FROM ${tableName} WHERE ${idColumnName} IN (?);`;
					const affectedRows = await useSql(
						getSqlite(),
						sqlstring.format(_sql, [toArray(id)]),
						'SELECT changes();',
					);
					return { affectedRows: affectedRows[0]?.['changes()'] };
				});
				_inject(
					instance,
					'select',
					async (
						fields?: object | boolean,
						condition?: Arrayable<string> | any[] | boolean,
						single?: boolean,
					) => {
						if (isBoolean(fields)) {
							single = fields;
							condition = [];
							fields = void 0;
						} else if (isBoolean(condition)) {
							// 第一个参数是字段，第二个参数是单条数据
							single = condition;
							condition = void 0;
						} else if (isBoolean(single)) {
							condition = toArray(condition).filter(Boolean) as any[];
						}
						if (isString(condition) || isUndef(condition)) {
							condition = toArray(condition).filter(Boolean) as any[];
						}
						// 参数归一化检测
						if (!isArray(condition)) {
							throw new Error('`condition` 字段必须为字符串或者字符串数组');
						}
						const conditionKeys: SelectConditionKeys[] = ['group', 'limit', 'offset', 'order', 'where'];
						const conditionStringCheck = condition.every(isString);
						const conditionObjectCheck = condition.every(i => {
							return isObject(i) && conditionKeys.includes(i.type);
						});
						if (condition.length && !conditionStringCheck && !conditionObjectCheck) {
							throw new Error(
								'`condition` 字段如果传入对象数组，则对象必须包含 `type` 字段，且 `type` 字段必须是 `group`、`limit`、`offset`、`order`、`where` 之一',
							);
						}
						if (condition.length && conditionStringCheck) {
							condition = [{ type: 'where', value: condition }];
						}
						if (isUndef(single)) {
							// 默认查询所有数据，且返回数组
							single = false;
						}
						const queryFields = [] as string[];
						if (isDef(fields)) {
							for (const field in fields) {
								const value = fields[field as keyof typeof fields];
								if (!isBoolean(value) && value !== 0 && value !== 1) {
									throw new Error('`fields` 对象属性值必须为布尔值或者 0/1');
								}
								if (!value) {
									continue;
								}
								const target = keys.find(item => item.key === field);
								if (!target) {
									throw new Error(`字段 ${field} 未注册`);
								}
								queryFields.push(sqlstring.escapeId(target.name));
							}
						} else {
							queryFields.push('*');
						}
						const conditionMap = (condition as SelectConditionArrays<any>).reduce(
							(prev, curr) => {
								const value = parseConditions(curr);
								if (value) {
									prev[curr.type] = value;
								}
								return prev;
							},
							{} as Record<SelectConditionKeys, string>,
						);
						const conditionStrings = [
							conditionMap.where,
							conditionMap.group,
							conditionMap.order,
							conditionMap.limit,
							conditionMap.offset,
						].filter(Boolean);
						const sql = `SELECT ${queryFields.join(',')} FROM ${tableName} ${conditionStrings.join(' ')};`;
						const result = await useSql(getSqlite(), [], sql);
						function _filter(value: object) {
							const result = {} as any;
							for (const key in value) {
								const target = keys.find(item => item.name === key);
								const data = value[key as keyof typeof value];
								if (!target) {
									throw new Error(`字段 ${key} 未注册`);
								}
								result[key] = parseValue(data, target.type);
							}
							return result;
						}
						if (!isArray(result)) {
							return result;
						}
						return single ? _filter(result[0]) : result.map(_filter);
					},
				);
				_inject(
					instance,
					'execute',
					async (
						sql: string | any[],
						params: object | any[],
						stringifyObjects?: boolean,
						timeZone?: string,
					) => {
						if (isString(sql)) {
							sql = [{ sql, params, stringifyObjects, timeZone }];
						}
						const sqls = sql.map(({ sql, params, stringifyObjects, timeZone }) => {
							return sqlstring.format(sql, params, stringifyObjects, timeZone);
						});
						const result = await useSql(getSqlite(), sqls);
						return result;
					},
				);
				_inject(
					instance,
					'sqlstring',
					async (sql: string, formatOptions?: SelectFormatOptions, single?: boolean) => {
						if (!isString(sql)) {
							throw new Error('sql 必须是字符串');
						}
						const { args, stringifyObjects, timeZone } = (formatOptions || {}) as SelectFormatOptions;
						const result = await useSql(
							getSqlite(),
							[],
							sqlstring.format(sql, args, stringifyObjects, timeZone),
						);
						return single ? result[0] : result;
					},
				);
				// 绑定所有经过转义的字段名
				Object.defineProperties(
					instance,
					keys.reduce(
						(prev, { name }) => {
							prev[name] = {
								...config,
								value: sqlstring.escapeId(name),
							};
							return prev;
						},
						{} as Record<string, PropertyDescriptor>,
					),
				);
				instanceCache.set(target, instance);
				return instance;
			},
			get(_, key: string) {
				if (key === 'prototype') {
					return target.prototype;
				}
				return Reflect.get(target, key);
			},
		});
	};
}

/**
 * 声明主键，自增整型
 */
export function Id() {
	return function (target: any, key: string) {
		if (Reflect.hasMetadata(TABLE_ID, target)) {
			throw new Error(`主键只能有一个`);
		}
		Reflect.defineMetadata(TABLE_ID, true, target);
		if (Reflect.hasMetadata(TABLE_FIELD, target)) {
			const columns = Reflect.getMetadata(TABLE_FIELD, target) as ColumnMetadata;
			const data = columns.find(item => item.key === key);
			if (data) {
				data.id = true;
				data.options.type = Type.INTEGER;
				data.options.key = true;
			}
		}
	};
}

/**
 * 声明表字段
 */
export function Column(_description?: string): Fn<[target: any, key: string], void>;
export function Column(options?: ColumnOptions, _description?: string): Fn<[target: any, key: string], void>;
export function Column(options?: ColumnOptions | string, _description?: string) {
	if (isString(options)) {
		_description = options;
		options = undefined;
	}
	options = options || {};
	return function (target: any, key: string) {
		options.name = options.name || key;
		const filter = ['close', 'open', 'insert', 'update', 'delete', 'query'] satisfies DisabledFields[];
		if (filter.includes(options.name as any)) {
			throw new Error(`字段名不能为 ${options.name}，与默认方法重名`);
		}
		const data = { key, options, id: false } satisfies ElementOf<ColumnMetadata>;
		if (!Reflect.hasMetadata(TABLE_FIELD, target)) {
			Reflect.defineMetadata(TABLE_FIELD, [data], target);
		} else {
			const columns = Reflect.getMetadata(TABLE_FIELD, target) as ColumnMetadata;
			if (columns.find(item => item.key === key)) {
				throw new Error(`列名 ${key} 已经存在`);
			}
			columns.push(data);
		}
	};
}
