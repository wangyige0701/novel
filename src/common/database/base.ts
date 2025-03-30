import type { Delete, Insert, TableId, Update } from '@/@types/common/database';
import type { Constructor, Fn } from '@wang-yige/utils';
import SQLite from './SQLite';

type Fields<T extends Constructor<any, any[]>> = {
	[K in keyof Omit<InstanceType<T>, keyof InstanceType<typeof BaseTable>>]?: any;
};

/**
 * 提供数据表基础方法
 */
export class BaseTable<T extends Constructor<any, any[]>> {
	/** 经过转义的表名 */
	static name: string;
	/** sqlite 实例 */
	static sqlite: SQLite;
	/** 插入一条数据 */
	insert: Fn<[fields: Fields<T>], Promise<Insert>>;
	/** 更新指定 id 的数据，可以传入多个 id */
	update: Fn<[id: TableId, fields: Fields<T>], Promise<Update>>;
	/** 删除指定 id 的数据，可以传入多个 id */
	delete: Fn<[id: TableId | string], Promise<Delete>>;
}
