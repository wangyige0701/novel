import 'reflect-metadata';
import sqlstring from 'sqlstring';
import { isArray, isFunction, type Fn } from '@wang-yige/utils';
import DatabaseConfig from '@/config/database';
import SQLite from './SQLite';

type SQLMetadata = {
	transaction: boolean; // 是否事务
	sql?: { type: 'execute' | 'select'; statement: string; params?: any[] | object };
};

const USE_DATABASE = Symbol.for('USE_DATABASE');
const SQL_METADATA = Symbol.for('SQL_METADATA');
const SQL_INITIAL = Symbol.for('SQL_INITIAL');
const instanceCache = new WeakMap<any, any>();

/**
 * 声明数据库，模型类上必须使用
 */
export function Database(database: keyof typeof DatabaseConfig) {
	return function (target: any, key?: string) {
		if (key) {
			Reflect.defineMetadata(USE_DATABASE, database, target, key);
		} else {
			Reflect.defineMetadata(USE_DATABASE, database, target.prototype);
			return new Proxy(class {} as any, {
				construct(_, ...args: any[]) {
					if (instanceCache.has(target)) {
						return instanceCache.get(target);
					}
					const instance = new target(...args);
					instanceCache.set(target, instance);
					const initialList = Reflect.getMetadata(SQL_INITIAL, target.prototype);
					if (isArray(initialList)) {
						initialList.forEach(initial => isFunction(initial) && initial(instance));
					}
					return instance;
				},
				get(_, key: string) {
					if (key === 'prototype') {
						return target.prototype;
					}
					return Reflect.get(target, key);
				},
			});
		}
	};
}

function getSqlMetadata(target: any, key: string) {
	if (!Reflect.hasMetadata(SQL_METADATA, target, key)) {
		const config = {
			enumerable: false,
			writable: false,
			configurable: false,
		} as PropertyDescriptor;
		const options = {
			transaction: false,
		} as SQLMetadata;
		// 绑定执行条件
		Reflect.defineMetadata(SQL_METADATA, options, target, key);
		// 注入成员属性的方法，接收实例
		const initial = (instance: any) => {
			const oldMethod = instance[key] as Fn<any[], any>;
			const useful = async function (this: any, ...args: any[]) {
				let database = Reflect.getMetadata(USE_DATABASE, target, key) as keyof typeof DatabaseConfig;
				if (!database) {
					database = Reflect.getMetadata(USE_DATABASE, target) as keyof typeof DatabaseConfig;
				}
				if (!database) {
					throw new Error('未指定数据库');
				}
				const { name, path } = DatabaseConfig[database];
				const sqlite = new SQLite(name, path);
				const options = Reflect.getMetadata(SQL_METADATA, target, key) as SQLMetadata;
				let result: any;
				await sqlite.open();
				try {
					if (options.transaction) {
						await sqlite.beginTransaction();
					}
					if (options.sql) {
						const { type, statement, params } = options.sql;
						const sql = sqlstring.format(statement, params);
						if (type === 'execute') {
							await sqlite.execute(sql);
						} else if (type === 'select') {
							result = await sqlite.select(sql);
						} else {
							throw new Error('不支持的 SQLite 操作类型');
						}
					}
					if (oldMethod && isFunction(oldMethod)) {
						result = await oldMethod.apply(this, args);
					}
					if (options.transaction) {
						await sqlite.commitTransaction();
					}
				} catch (error) {
					if (options.transaction) {
						await sqlite.rollbackTransaction();
					}
				}
				await sqlite.close();
				return result;
			};
			Object.defineProperty(instance, key, {
				...config,
				value: useful,
			});
		};
		// 绑定初始化函数
		if (!Reflect.hasMetadata(SQL_INITIAL, target)) {
			Reflect.defineMetadata(SQL_INITIAL, [], target);
		}
		const initialList = Reflect.getMetadata(SQL_INITIAL, target) as any[];
		initialList.push(initial);
	}
	return Reflect.getMetadata(SQL_METADATA, target, key) as SQLMetadata;
}

/**
 * 声明事务
 */
export function Transcation() {
	return function (target: any, key: string) {
		const metadata = getSqlMetadata(target, key);
		if (metadata) {
			metadata.transaction = true;
		}
	};
}

/**
 * 声明一个 SQLite 执行语句
 */
export function Execute(sql: string, params?: any[]) {
	return function (target: any, key: string) {
		const metadata = getSqlMetadata(target, key);
		if (metadata) {
			metadata.sql = {
				type: 'execute',
				statement: sql,
				params,
			};
		}
	};
}

/**
 * 声明一个 SQLite 查询语句
 */
export function Select(sql: string, params?: any[]) {
	return function (target: any, key: string) {
		const metadata = getSqlMetadata(target, key);
		if (metadata) {
			metadata.sql = {
				type: 'select',
				statement: sql,
				params,
			};
		}
	};
}
