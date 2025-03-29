import 'reflect-metadata';
import sqlstring from 'sqlstring';
import { type ElementOf, type Fn, isNumber, isString, isUndef, toArray } from '@wang-yige/utils';
import type { ColumnOptions, TableId, TableOptions } from '@/@types/common/database';
import DatabaseConfig, { Type } from '@/config/database';
import SQLite from './SQLite';

type ColumnMetadata = Array<{
	id: boolean;
	key: string;
	options: ColumnOptions;
}>;

const TABLE_FIELD = Symbol.for('database#tableField');
const TABLE_ID = Symbol.for('database#tableId');

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
	if (nullable) {
		if (_default) {
			merges.push(`DEFAULT ${_default}`);
		} else if (isUpdate) {
			throw new Error(`更新的列 ${name} 允许为空但是没有提供默认值`);
		}
	} else {
		merges.push('NOT NULL');
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
 * 数据表更新处理
 * @param sqlite 数据库实例
 * @param tableName 未进行转义的数据表名
 * @param columns 所有列的元数据
 * @param createSql 创建表的 sql 语句获取方法
 */
async function updateTableSql(
	sqlite: SQLite,
	tableName: string,
	columns: ColumnMetadata,
	createSql: Fn<[string], string>,
) {
	const escapeTableName = sqlstring.escapeId(tableName);
	await sqlite.open();
	const result = (await sqlite.select(`PRAGMA table_info(${escapeTableName})`)) as Array<{
		name: string;
		type: string;
	}>;
	if (!result || !result.length) {
		await sqlite.close();
		return;
	}
	const tableColumns = columns.map(item => item.options);
	const adds = [] as ColumnOptions[];
	const modifies = [] as string[];
	const removes = [] as string[];
	const sqls = [] as string[];
	// 收集新增字段
	for (const column of tableColumns) {
		const target = result.find(item => item.name === column.name);
		if (!target) {
			adds.push(column);
			continue;
		}
		if (target.type !== column.type && !modifies.find(item => item === column.name)) {
			modifies.push(target.name);
		}
	}
	// 收集删除字段
	for (const item of result) {
		const target = tableColumns.find(column => column.name === item.name);
		if (!target) {
			removes.push(item.name);
			continue;
		}
		if (target.type !== item.type && !modifies.find(name => name === target.name)) {
			modifies.push(item.name);
		}
	}
	console.log(adds);
	console.log(modifies);
	console.log(removes);

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
		sqls.push(
			...[
				createSql(tempName),
				`INSERT INTO ${tempName} (${copyColumns}) SELECT ${copyColumns} FROM ${escapeTableName}};`,
				`DROP TABLE ${escapeTableName};`,
				`ALTER TABLE ${tempName} RENAME TO ${escapeTableName};`,
			],
		);
	} else if (adds.length) {
		// 新增字段
		sqls.push(
			...adds.map(item => {
				return `ALTER TABLE ${escapeTableName} ADD COLUMN ${columnSql(item)};`;
			}),
		);
	} else {
		await sqlite.close();
		return;
	}
	await sqlite.execute(sqls);
	await sqlite.close();
	return sqls;
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
		const { name, database = 'main', test = false } = options;
		const columns = (Reflect.getMetadata(TABLE_FIELD, target.prototype) || []) as ColumnMetadata;
		// 新建表
		let idColumnName = 'id';
		const keys = new Set<string>();
		const tableName = sqlstring.escapeId(name);
		const fields = columns.map(column => {
			const columnName = sqlstring.escapeId(column.options.name!);
			if (column.id) {
				idColumnName = columnName!;
				return `${columnName} INTEGER PRIMARY KEY AUTOINCREMENT`;
			} else {
				// 记录字段
				keys.add(columnName!);
				return columnSql(column.options);
			}
		});
		/** 获取数据表创建的 sql */
		const sql = (useTableName: string = tableName) => {
			return `CREATE TABLE IF NOT EXISTS ${useTableName} (${fields.join(',')});`;
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
		/** 执行 sql 语句，没有查询所以未提供 select 语法 */
		const execute = async (sql: string | string[], sqlite?: SQLite) => {
			if (!sqlite) {
				sqlite = getSqlite();
			}
			await sqlite.open();
			const result = await sqlite.execute(sql);
			await sqlite.close();
			return result;
		};
		/** 数据表名属性注入 */
		Object.defineProperty(target, 'name', {
			...config,
			value: tableName,
		});
		Object.defineProperty(target.prototype, '__sql', {
			...config,
			get: () => sql(),
		});
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
		// 数据表创建方法
		Object.defineProperty(target.prototype, '__create', {
			...config,
			value: async () => {
				if (test && import.meta.env.PROD) {
					// 测试表，生产环境不创建
					return;
				}
				// 如果更新表，则不继续执行
				let update;
				if ((update = await updateTableSql(getSqlite(), name, columns, sql))) {
					console.log(`数据表 ${name} 更新成功：\n${update.join('\n')}`);
					return;
				}
				return await execute(sql());
			},
		});
		// 注入基础方法
		Object.defineProperties(target.prototype, {
			insert: {
				...config,
				value: async (fields: object) => {
					const list = [...keys.entries()].map(item => item[0]);
					const datas = {} as Record<string, any>;
					for (const key of list) {
						if (key in fields) {
							datas[key] = fields[key as keyof typeof fields];
							continue;
						}
						datas[key] = null;
					}
					const lastRowtId = await execute([
						sqlstring.format(`INSERT INTO ${tableName} SET ?;`, [datas]),
						'SELECT last_insert_rowid();',
					]);
					return { lastRowtId };
				},
			},
			update: {
				...config,
				value: async (id: TableId, fields: object) => {
					if (!isString(id) || !isNumber(id)) {
						throw new Error('id 必须是字符串或数字');
					}
					const datas = { ...fields } as Record<string, any>;
					for (const key in datas) {
						if (isUndef(datas[key])) {
							datas[key] = 'NULL';
						}
					}
					const result = await execute(
						sqlstring.format(
							`UPDATE ${tableName} SET ? WHERE ${idColumnName} IN (?) RETURNING ${idColumnName}`,
							[datas, toArray(id)],
						),
					);
					return {
						affectedRows: result?.length || 0,
					};
				},
			},
			delete: {
				...config,
				value: async (id: TableId) => {
					if (!isString(id) || !isNumber(id)) {
						throw new Error('id 必须是字符串或数字');
					}
					const result = await execute(
						sqlstring.format(
							`DELETE FROM ${tableName} WHERE ${idColumnName} IN (?) RETURNING ${idColumnName}`,
							[toArray(id)],
						),
					);
					return {
						affectedRows: result?.length || 0,
					};
				},
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
