import 'reflect-metadata';
import type { ColumnOptions, TableOptions } from '@/@types/common/database';
import Database, { Type } from '@/config/database';
import SQLite from './SQLite';
import { ElementOf, Fn, isString } from '@wang-yige/utils';

type ColumnMetadata = Array<{
	id: boolean;
	key: string;
	options: ColumnOptions;
}>;

const TABLE_FIELD = Symbol.for('database#tableField');

export { Type };

/**
 * 声明表
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
		const fields = columns.map(column => {
			const { type, name, unique = false, nullable = true, key = false, default: _default } = column.options;
			if (column.id) {
				return `${name} INTEGER PRIMARY KEY AUTOINCREMENT`;
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
				return `${name} ${merges.join(' ')}`;
			}
		});
		const sql = `CREATE TABLE IF NOT EXISTS ${name} (${fields.join(',')});`;
		Object.defineProperty(target.prototype, '__sql', {
			value: sql,
		});
		Object.defineProperty(target.prototype, '__info', {
			value: () => {
				const config = Database[database];
				return {
					name: config.name,
					path: config.path,
					table: name,
				};
			},
		});
		Object.defineProperty(target.prototype, '__create', {
			value: async () => {
				if (test && import.meta.env.PROD) {
					return;
				}
				const config = Database[database];
				const sqlite = new SQLite(config.name, config.path);
				await sqlite.open();
				await sqlite.execute(sql);
				await sqlite.close();
			},
		});
	};
}

/**
 * 声明主键
 */
export function Id() {
	return function (target: any, key: string) {
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
