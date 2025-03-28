import type { Type } from '@/config/database';
import database from '@/config/database';

export interface TableOptions {
	name: string;
	database?: keyof typeof database;
	/** 是否是测试环境的表，默认 `false` */
	test?: boolean;
}

export interface ColumnOptions {
	/** 类型，推荐声明 */
	type?: Type;
	/** 是否是主键，默认 `false` */
	key?: boolean;
	/** 列名 */
	name?: string;
	/** 是否为空，默认 `true` */
	nullable?: boolean;
	/** 为空时的默认值 */
	default?: any;
	/** 默认 `false` */
	unique?: boolean;
}

export type TableId = string | number | Array<string | number>;

export type Insert = {
	/** 插入的 id */
	lastRowtId: number;
};

export type Update = {
	/** 修改的行数 */
	affectedRows: number;
};

export type Delete = {
	/** 删除的行数 */
	affectedRows: number;
};
