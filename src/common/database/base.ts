import type { Delete, Insert, TableId, Update } from '@/@types/common/database';
import type { Constructor, Fn } from '@wang-yige/utils';

type Fields<T extends Constructor<any, any[]>> = {
	[K in keyof Omit<InstanceType<T>, keyof InstanceType<typeof BaseTable>>]?: any;
};

/**
 * 提供数据表基础方法
 */
export class BaseTable<T extends Constructor<any, any[]>> {
	insert: Fn<[fields: Fields<T>], Insert>;
	update: Fn<[id: TableId, fields: Fields<T>], Update>;
	delete: Fn<[id: TableId | string], Delete>;
}
