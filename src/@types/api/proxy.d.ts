export type SearchProxyData = {
	/** 域名 */
	domain: string;
	/** h5环境的代理别名 */
	alias: string;
	/** 节点描述 */
	description: string;
	/** 是否是本地代理 */
	local?: boolean;
};

/**
 * 代理列表
 */
export type SearchProxy = {
	biqu: SearchProxyData;
};
