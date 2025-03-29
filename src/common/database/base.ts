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

	insert: Fn<[fields: Fields<T>], Promise<Insert>>;
	update: Fn<[id: TableId, fields: Fields<T>], Promise<Update>>;
	delete: Fn<[id: TableId | string], Promise<Delete>>;
}
