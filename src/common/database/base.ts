import type { Delete, Insert, TableId, Update } from '@/@types/common/database';
import type { Arrayable, Constructor, Fn } from '@wang-yige/utils';
import SQLite from './SQLite';

export type DisabledFields = 'open' | 'close' | 'insert' | 'update' | 'delete' | 'query';

type Fields<T extends Constructor<any, any[]>> = {
	[K in keyof Omit<InstanceType<T>, keyof InstanceType<typeof BaseTable>>]?: any;
};

type FilterFields<T extends Constructor<any, any[]>> = Omit<InstanceType<T>, DisabledFields>;

type OverwriteFields<T extends object> = {
	[K in keyof T]: boolean | 0 | 1;
};

type FilterOriginFields<T extends Constructor<any, any[]>, F extends Record<string, boolean | 0 | 1 | undefined>> = {
	[K in keyof F as F[K] extends true ? K : never]: T[K & keyof T];
};

type InsertFun<T extends Constructor<any, any[]>> = {
	/** 插入一条数据 */
	(fields: Fields<T>): Promise<Insert>;
	/** 插入多条数据 */
	(fields: Fields<T>[]): Promise<Insert[]>;
};

type Single<T extends any, S extends boolean> = S extends true ? T | undefined : T[];

type SelectFun<T extends Constructor<any, any[]>> = {
	/** 查询全部数据 */
	(): Promise<FilterFields<T>[]>;
	/**
	 * @param fields 查询过滤字段，传入对象，对象值为 boolean 或者 0/1
	 */
	<F extends Partial<OverwriteFields<FilterFields<T>>>>(fields: F): Promise<FilterOriginFields<T, F>[]>;
	/**
	 * @param condition 查询条件，传入数组时，内部条件通过 AND 连接
	 */
	(condition?: Arrayable<string>): Promise<FilterFields<T>[]>;
	/**
	 * @param single 是否只返回一条数据
	 */
	<S extends boolean>(single?: S): Promise<Single<FilterFields<T>, S>>;
	/**
	 * @param condition 查询条件，传入数组时，内部条件通过 AND 连接
	 * @param single 是否只返回一条数据
	 */
	<S extends boolean>(condition?: Arrayable<string>, single?: S): Promise<Single<FilterFields<T>, S>>;
	/**
	 * @param fields 查询过滤字段，传入对象，对象值为 boolean 或者 0/1
	 * @param condition 查询条件，传入数组时，内部条件通过 AND 连接
	 */
	<F extends Partial<OverwriteFields<FilterFields<T>>>>(
		fields: F,
		condition?: Arrayable<string>,
	): Promise<FilterOriginFields<T, F>[]>;
	/**
	 * @param fields 查询过滤字段，传入对象，对象值为 boolean 或者 0/1
	 * @param single 是否只返回一条数据
	 */
	<F extends Partial<OverwriteFields<FilterFields<T>>>, S extends boolean>(
		fields: F,
		single?: S,
	): Promise<Single<FilterOriginFields<T, F>, S>>;
	/**
	 * @param fields 查询过滤字段，传入对象，对象值为 boolean 或者 0/1
	 * @param condition 查询条件，传入数组时，内部条件通过 AND 连接
	 * @param single 是否只返回一条数据
	 */
	<F extends Partial<OverwriteFields<FilterFields<T>>>, S extends boolean>(
		fields: F,
		condition?: Arrayable<string>,
		single?: S,
	): Promise<Single<FilterOriginFields<T, F>, S>>;
};

type ExecuteSql = { sql: string; params?: object | any[]; stringifyObjects?: boolean; timeZone?: string };

type ExecuteFun = {
	/** 执行非 select 的 sql 语句 */
	(sql: string, params?: object | any[], stringifyObjects?: boolean, timeZone?: string): Promise<any>;
	/** 执行非 select 的 sql 语句 */
	(sqls: Array<ExecuteSql>): Promise<any>;
};

/**
 * 提供数据表基础方法
 */
export class BaseTable<T extends Constructor<any, any[]>> {
	/** 经过转义的表名 */
	static name: string;
	/** sqlite 实例 */
	static sqlite: SQLite;
	/** 手动打开数据库，如果执行此函数则内部方法不会自动开启数据库，且需要手动执行关闭函数 */
	open: Fn<[], BaseTable<T>>;
	/** 手动关闭数据库 */
	close: Fn<[], void>;
	/** 插入一条数据 */
	insert: InsertFun<T>;
	/** 更新指定 id 的数据，可以传入多个 id */
	update: Fn<[id: TableId, fields: Fields<T>], Promise<Update>>;
	/** 删除指定 id 的数据，可以传入多个 id */
	delete: Fn<[id: TableId | string], Promise<Delete>>;
	/**
	 * 查询简单数据，不能排序不能关联表，复杂查询需要写 sql 语句
	 * @param fields 查询过滤字段，传入对象，对象值为 boolean 或者 0/1
	 * @param condition 查询条件，传入数组时，内部条件通过 AND 连接
	 * @param single 是否只返回一条数据
	 */
	select: SelectFun<T>;
	/** 执行 sql */
	execute: ExecuteFun;
}
