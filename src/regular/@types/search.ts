/**
 * 列表数据
 */
export type ListTarget = {
	name: string;
	href: string;
	author: string;
	type: string;
};

/**
 * 查询列表数据处理返回类型
 */
export type ListReturnVal = {
	[K in keyof ListTarget]: ListTarget[K];
};
