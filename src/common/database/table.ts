import 'reflect-metadata';
import sqlstring from 'sqlstring';
import {
	type ElementOf,
	type Fn,
	isArray,
	isBoolean,
	isDef,
	isNumber,
	isString,
	isUndef,
	toArray,
	toString,
} from '@wang-yige/utils';
import type { ColumnOptions, IndexOptions, TableId, TableOptions } from '@/@types/common/database';
import DatabaseConfig, { Type } from '@/config/database';
import SQLite from './SQLite';
import { BaseTable } from './base';

type ColumnMetadata = Array<{
	id: boolean;
	key: string;
	options: ColumnOptions;
}>;

type SqliteColumnOption = {
	cid: number;
	name: string;
	type: string;
	notnull: number;
	dflt_value: string | null;
	pk: number;
};

type SqliteIndexOption = {
	seq: number;
	name: string;
	unique: number;
	origin: string;
	partial: number;
};

const TABLE_FIELD = Symbol.for('database#tableField');
const TABLE_ID = Symbol.for('database#tableId');
const instanceCache = new WeakMap<any, any>();

export { Type };

/**
 * 根据列的元数据生成对应的字段创建 SQL 语句
 * @param options 列元数据配置项
 * @param isUpdate 是否用于更新语法，更新字段时，空字段必须有默认值
 */
function columnSql(options: ColumnOptions, isUpdate: boolean = false) {
	const { type, name, unique = false, nullable = true, key = false, default: _default } = options;
	const merges = [];
	if (type) {
		merges.push(Type[type]);
	}
	if (!nullable) {
		merges.push('NOT NULL');
	}
	if (isDef(_default)) {
		merges.push(`DEFAULT ${_default}`);
	} else if (isUpdate) {
		throw new Error(`更新的列 ${name} 允许为空但是没有提供默认值`);
	}
	if (unique) {
		merges.push('UNIQUE');
	}
	if (key) {
		merges.push('PRIMARY KEY');
	}
	return sqlstring.escapeId(name) + ' ' + merges.join(' ');
}

/**
 * 生成索引语句
 */
function compareIndexs(tableName: string, current: IndexOptions[], origin: SqliteIndexOption[] = []) {
	const add = [] as IndexOptions[];
	const remove = [] as string[];
	for (const item of current) {
		const target = origin.find(i => i.name === item.name);
		if (!target) {
			add.push(item);
		} else {
			const unique = isBoolean(item.unique) ? +item.unique : 0;
			// 判断唯一索引以及条件索引是否保持一直，不会检查具体条件
			if (unique !== target.unique || +!!item.where !== target.partial) {
				remove.push(item.name);
				add.push(item);
			}
		}
	}
	for (const item of origin) {
		// unique 和 primary key 自动创建的索引不进行更新
		if (item.origin === 'u' || item.origin === 'pk') {
			continue;
		}
		const target = current.find(i => i.name === item.name);
		if (!target) {
			remove.push(item.name);
		}
	}
	return {
		add: add.map(i => {
			const columns = toArray(i.columns)
				.map(v => sqlstring.escapeId(v))
				.join(',');
			if (i.unique) {
				return `CREATE UNIQUE INDEX ${sqlstring.escapeId(i.name)} ON ${tableName} (${columns});`;
			}
			if (i.where) {
				return `CREATE INDEX ${sqlstring.escapeId(i.name)} ON ${tableName} (${columns}) WHERE ${i.where};`;
			}
			return `CREATE INDEX ${sqlstring.escapeId(i.name)} ON ${tableName} (${columns});`;
		}),
		remove: remove.map(name => {
			return `DROP INDEX IF EXISTS ${sqlstring.escapeId(name)};`;
		}),
	};
}

/**
 * 比较传入字段和数据库字段
 * @return false 需要更新， true 不需要更新
 */
function compareColumn(current: ColumnOptions, origin: SqliteColumnOption) {
	const { type: currentType, default: _default, nullable = true, key = false } = current;
	const { type: originType, dflt_value, notnull, pk } = origin;
	if (currentType !== originType) {
		return false;
	}
	if (+key !== +pk) {
		return false;
	}
	if (+nullable !== +!notnull) {
		return false;
	}
	if ((isDef(_default) || isDef(dflt_value)) && toString(_default) !== toString(dflt_value)) {
		return false;
	}
	return true;
}

/**
 * 数据表更新处理
 * @param sqlite 数据库实例
 * @param tableName 未进行转义的数据表名
 * @param columns 所有列的元数据
 * @param indexs 所有索引的元数据
 * @param createSql 创建表的 sql 语句获取方法
 */
async function updateTableSql(
	sqlite: SQLite,
	tableName: string,
	columns: ColumnMetadata,
	indexs: IndexOptions[],
	createSql: Fn<[string], string[]>,
) {
	const escapeTableName = sqlstring.escapeId(tableName);
	await sqlite.open();
	const infoList = (await sqlite.select(`PRAGMA table_info(${escapeTableName});`)) as Array<SqliteColumnOption>;
	const indexList = (await sqlite.select(`PRAGMA index_list(${escapeTableName});`)) as Array<SqliteIndexOption>;
	if (!infoList || !infoList.length) {
		await sqlite.close();
		return;
	}
	const tableColumns = columns.map(item => item.options);
	const adds = [] as ColumnOptions[];
	const modifies = [] as string[];
	const removes = [] as string[];
	// 收集新增字段
	for (const column of tableColumns) {
		const target = infoList.find(item => item.name === column.name);
		if (!target) {
			adds.push(column);
			continue;
		}
		if (!compareColumn(column, target) && !modifies.find(item => item === column.name)) {
			modifies.push(target.name);
		}
	}
	// 收集删除字段
	for (const item of infoList) {
		const target = tableColumns.find(column => column.name === item.name);
		if (!target) {
			removes.push(item.name);
		}
	}
	const _execute = async (sqls: string[]) => {
		await sqlite.execute(sqls);
		await sqlite.close();
		return sqls;
	};
	if (modifies.length || removes.length) {
		// 创建临时表并迁移数据
		const tempName = sqlstring.escapeId(tableName + '_new_temp');
		const copyColumns = columns
			.map(item => {
				if (!removes.includes(item.options.name!)) {
					return sqlstring.escapeId(item.options.name);
				}
			})
			.filter(Boolean)
			.join(',');
		return await _execute([
			`DROP TABLE IF EXISTS ${tempName};`,
			...createSql(tempName),
			`INSERT INTO ${tempName} (${copyColumns}) SELECT ${copyColumns} FROM ${escapeTableName};`,
			`DROP TABLE ${escapeTableName};`,
			`ALTER TABLE ${tempName} RENAME TO ${escapeTableName};`,
			...compareIndexs(escapeTableName, indexs).add,
		]);
	}
	/** 索引更新执行的 sql */
	const indexSqls = compareIndexs(escapeTableName, indexs, indexList);
	if (adds.length) {
		// 新增字段
		return await _execute([
			...adds.map(item => {
				return `ALTER TABLE ${escapeTableName} ADD COLUMN ${columnSql(item)};`;
			}),
			...indexSqls.remove,
			...indexSqls.add,
		]);
	}
	const updateIndexs = [...indexSqls.remove, ...indexSqls.add];
	if (updateIndexs.length) {
		return await _execute(updateIndexs);
	}
	await sqlite.close();
	return;
}

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
		const keys = new Array<{ name: string; id: boolean; key: string }>();
		/** 转义后的表名 */
		const tableName = sqlstring.escapeId(name);
		const fields = columns.map(column => {
			const columnName = sqlstring.escapeId(column.options.name!);
			const length = keys.push({ name: column.options.name!, key: column.key, id: false });
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
		const getSqlite = () => {
			const config = DatabaseConfig[database];
			return new SQLite(config.name, config.path);
		};
		/** 执行 sql 语句 */
		const useSql = async (sqlite: SQLite, executeSql: string | string[], selectSql?: string) => {
			if (!selfDatabaseStatus) {
				await sqlite.open();
			}
			if ((isString(executeSql) && executeSql) || (isArray(executeSql) && executeSql.length)) {
				await sqlite.execute(executeSql);
			}
			let result;
			if (selectSql) {
				result = await sqlite.select(selectSql);
			}
			if (!selfDatabaseStatus) {
				await sqlite.close();
			}
			return result;
		};
		// sqlite 实例注入
		Object.defineProperty(target, 'sqlite', {
			...config,
			value: getSqlite(),
		});
		// 表名属性注入
		Object.defineProperty(target, 'name', {
			...config,
			value: tableName,
		});
		// 预执行的 sql 语句注入
		Object.defineProperty(target.prototype, '__sql', {
			...config,
			value: sql().join('\n'),
		});
		// 数据库信息注入
		Object.defineProperty(target.prototype, '__info', {
			...config,
			value: () => {
				const config = DatabaseConfig[database];
				return {
					name: config.name,
					path: config.path,
					table: name,
				};
			},
		});
		// 数据表创建执行函数注入
		Object.defineProperty(target.prototype, '__create', {
			...config,
			value: async () => {
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
			},
		});
		// 单例缓存
		return new Proxy(class {}, {
			construct(_, ...args: any[]) {
				if (instanceCache.has(target)) {
					return instanceCache.get(target);
				}
				const instance = new target(...args);
				// 注入基础方法
				Object.defineProperties(instance, {
					open: {
						...config,
						value: async () => {
							selfDatabaseStatus = true;
							await getSqlite().open();
							return instance;
						},
					},
					close: {
						...config,
						value: async () => {
							if (!selfDatabaseStatus) {
								throw new Error('数据库未手动打开');
							}
							selfDatabaseStatus = false;
							await getSqlite().close();
						},
					},
					insert: {
						...config,
						value: async (fields: object) => {
							// 过滤掉主键字段
							const list = keys
								.filter(item => !item.id)
								.map(item => ({ name: item.name, key: item.key }));
							const datas = {} as Record<string, any>;
							// 表字段和对应属性不一定相同，需要分开处理
							for (const { name, key } of list) {
								if (key in fields) {
									datas[sqlstring.escapeId(name)] = fields[key as keyof typeof fields];
									continue;
								}
								datas[sqlstring.escapeId(name)] = 'NULL';
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
						},
					},
					insertMulti: {
						...config,
						value: async (fields: object[]) => {
							if (!isArray(fields)) {
								throw new Error('批量插入数据必须为数组');
							}
							await instance.open();
							const sqlite = getSqlite();
							const results = [];
							try {
								await sqlite.beginTransaction();
								for (const field of fields) {
									results.push(await instance.insert(field));
								}
								await sqlite.commitTransaction();
							} catch (error) {
								await sqlite.rollbackTransaction();
							}
							await instance.close();
							return results;
						},
					},
					update: {
						...config,
						value: async (id: TableId, fields: object) => {
							if (!idColumnName) {
								throw new Error('使用 `update` 方法时，必须使用 ID 装饰器注册主键字段');
							}
							if (!isString(id) && !isNumber(id)) {
								throw new Error(`${idColumnName} 必须是字符串或数字`);
							}
							const datas = { ...fields } as Record<string, any>;
							for (const key in datas) {
								if (isUndef(datas[key])) {
									datas[key] = 'NULL';
								}
							}
							const _sql = `UPDATE ${tableName} SET ? WHERE ${idColumnName} IN (?);`;
							const affectedRows = await useSql(
								getSqlite(),
								sqlstring.format(_sql, [datas, toArray(id)]),
								'SELECT changes();',
							);
							return { affectedRows: affectedRows[0]?.['changes()'] };
						},
					},
					delete: {
						...config,
						value: async (id: TableId) => {
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
						},
					},
				});
				const bindKeyNames = keys.reduce(
					(prev, { name }) => {
						prev[name] = {
							...config,
							value: sqlstring.escapeId(name),
						};
						return prev;
					},
					{} as Record<string, PropertyDescriptor>,
				);
				// 绑定所有经过转义的字段名
				Object.defineProperties(instance, bindKeyNames);
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
