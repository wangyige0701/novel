import type { Type } from '@/config/database';
import type database from '@/config/database';
import type { Fn } from '@wang-yige/utils';

interface IndexOptions {
	/** 索引名 */
	name: string;
	/** 索引字段 */
	columns: string[] | string;
	/** 是否是唯一索引，默认 `false` */
	unique?: boolean;
	/** 条件索引 */
	where?: string;
}

export interface TableOptions {
	/** 数据表名 */
	name: string;
	/** 创建表的数据库 */
	database?: keyof typeof database;
	/** 索引配置 */
	indexs?: IndexOptions[];
	/** 是否是测试环境的表，默认 `false` */
	test?: boolean;
	/** 是否禁用，默认 `false` */
	disabled?: boolean;
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
	/** 通过默认方法插入数据时，提供的默认值，如果为函数则会执行 */
	dltVal?: Fn<[], any> | any;
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
