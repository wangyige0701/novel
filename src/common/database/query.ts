import 'reflect-metadata';
import sqlstring from 'sqlstring';
import { isFunction, type Fn } from '@wang-yige/utils';
import DatabaseConfig from '@/config/database';
import SQLite from './SQLite';

type SQLMetadata = {
	transaction: boolean; // 是否事务
	sql?: { type: 'execute' | 'select'; statement: string; params?: any[] | object };
};

const USE_DATABASE = Symbol.for('USE_DATABASE');
const SQL_METADATA = Symbol.for('SQL_METADATA');

/**
 * 用于获取包含有 sql 执行结果的符号
 */
export const SQL = Symbol('@SQL');

/**
 * 声明数据库，没有声明则为 `main`
 */
export function Database(database: keyof typeof DatabaseConfig) {
	return function (target: any, key?: string) {
		if (key) {
			Reflect.defineMetadata(USE_DATABASE, database, target, key);
		} else {
			Reflect.defineMetadata(USE_DATABASE, database, target.prototype);
		}
	};
}

function getSqlMetadata(target: any, key: string, descriptor: PropertyDescriptor) {
	if (!Reflect.hasMetadata(SQL_METADATA, target, key)) {
		const options = {
			transaction: false,
		} as SQLMetadata;
		Reflect.defineMetadata(SQL_METADATA, options, target, key);
		const oldMethod = descriptor.value as Fn<any[], any>;
		descriptor.value = async function (this: any, ...args: any[]) {
			const database = (Reflect.getMetadata(USE_DATABASE, target, key) as keyof typeof DatabaseConfig) || 'main';
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
						this[SQL] = await sqlite.execute(sql);
					} else if (type === 'select') {
						this[SQL] = await sqlite.select(sql);
					} else {
						throw new Error('不支持的 SQL 类型');
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
	}
	return Reflect.getMetadata(SQL_METADATA, target, key) as SQLMetadata;
}

/**
 * 声明事务
 */
export function Transcation() {
	return function (target: any, key: string, descriptor: PropertyDescriptor) {
		const metadata = getSqlMetadata(target, key, descriptor);
		if (metadata) {
			metadata.transaction = true;
		}
	};
}

/**
 * 声明一个 SQLite 执行语句
 */
export function Execute(sql: string, params?: any[]) {
	return function (target: any, key: string, descriptor: PropertyDescriptor) {
		const metadata = getSqlMetadata(target, key, descriptor);
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
	return function (target: any, key: string, descriptor: PropertyDescriptor) {
		const metadata = getSqlMetadata(target, key, descriptor);
		if (metadata) {
			metadata.sql = {
				type: 'select',
				statement: sql,
				params,
			};
		}
	};
}
