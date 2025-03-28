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
		let idColumnName = 'id';
		const keys = new Set<string>();
		const tableName = sqlstring.escapeId(name);
		const fields = columns.map(column => {
			const { type, name, unique = false, nullable = true, key = false, default: _default } = column.options;
			const columnName = sqlstring.escapeId(name);
			if (column.id) {
				idColumnName = columnName!;
				return `${sqlstring.escapeId(columnName)} INTEGER PRIMARY KEY AUTOINCREMENT`;
			} else {
				const merges = [];
				if (type) {
					merges.push(Type[type]);
				}
				if (nullable) {
					merges.push('NULL');
					if (_default) {
						merges.push(`DEFAULT ${_default}`);
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
				// 记录字段
				keys.add(columnName!);
				return `${sqlstring.escapeId(columnName)} ${merges.join(' ')}`;
			}
		});
		const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${fields.join(',')});`;
		const config = {
			enumerable: false,
			writable: false,
			configurable: false,
		} as PropertyDescriptor;
		const execute = async (sql: string | string[]) => {
			const config = DatabaseConfig[database];
			const sqlite = new SQLite(config.name, config.path);
			await sqlite.open();
			const result = await sqlite.execute(sql);
			await sqlite.close();
			return result;
		};
		Object.defineProperty(target.prototype, '__sql', {
			...config,
			value: sql,
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
				return await execute(sql);
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
