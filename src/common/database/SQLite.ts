import { isDef, PartialOptional, toArray } from '@wang-yige/utils';

type Options = Omit<PartialOptional<PlusSqliteOpenDatabaseOptions, 'success' | 'fail'>, 'success' | 'fail'>;

class SQLiteTransaction {
	private name: string;

	constructor(name: string) {
		this.name = name;
	}

	private use(operation: 'begin' | 'commit' | 'rollback') {
		return new Promise((resolve, reject) => {
			plus.sqlite.transaction({
				name: this.name,
				operation,
				success(result) {
					resolve(result);
				},
				fail(result) {
					reject(result);
				},
			});
		});
	}

	/**
	 * 开启事务
	 */
	public begin() {
		return this.use('begin');
	}

	/**
	 * 提交事务
	 */
	public commit() {
		return this.use('commit');
	}

	/**
	 * 回滚事务
	 */
	public rollback() {
		return this.use('rollback');
	}
}

/**
 * 使用 html5plus 的 sqlite 模块
 */
export default class SQLite {
	private static cache: Map<string, SQLite> = new Map();

	/**
	 * SQLite 是否可用
	 */
	public static get usable() {
		// #ifdef APP
		return isDef(plus.sqlite);
		// #endif
		// #ifndef APP
		return false;
		// #endif
	}

	private name: string;
	private path: string.JSURIString | string;
	private __transaction: SQLiteTransaction | null = null;

	constructor(name: string, path: string.JSURIString | string) {
		if (!SQLite.usable) {
			throw new Error('SQLite is not available');
		}
		const key = name && path ? `key:${name}:${path}` : '__default__';
		if (SQLite.cache.has(key)) {
			return SQLite.cache.get(key)!;
		}
		SQLite.cache.set(key, this);
		this.name = name;
		this.path = path;
	}

	/**
	 * 打开数据库
	 */
	public open() {
		return new Promise<any>((resolve, reject) => {
			plus.sqlite.openDatabase({
				name: this.name,
				path: this.path,
				success(result) {
					resolve(result);
				},
				fail(result) {
					reject(result);
				},
			});
		});
	}

	/**
	 * 数据库是否打开
	 */
	public get isOpen() {
		return plus.sqlite.isOpenDatabase({ name: this.name, path: this.path });
	}

	/**
	 * 关闭数据库
	 */
	public close() {
		return new Promise<any>((resolve, reject) => {
			plus.sqlite.closeDatabase({
				name: this.name,
				success(result) {
					resolve(result);
				},
				fail(result) {
					reject(result);
				},
			});
		});
	}

	/**
	 * 获取一个事务实例
	 */
	public transaction() {
		if (!this.__transaction) {
			this.__transaction = new SQLiteTransaction(this.name);
		}
		return this.__transaction;
	}

	public execute(sql: string | string[]) {
		return new Promise<any>((resolve, reject) => {
			plus.sqlite.executeSql({
				name: this.name,
				sql: toArray(sql),
				success(result) {
					resolve(result);
				},
				fail(result) {
					reject(result);
				},
			});
		});
	}

	public select(sql: string) {
		return new Promise<any>((resolve, reject) => {
			plus.sqlite.selectSql({
				name: this.name,
				sql,
				success(result) {
					resolve(result);
				},
				fail(result) {
					reject(result);
				},
			});
		});
	}
}
