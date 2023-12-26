/** 接口数据配置 */
export const interfaceInfo = {
	dingdian: {
		domain: 'https://m.ytryx.com/',
		search: 'search',
	},
} as const;

/** 网络请求对象 */
export const NetRequest: {
	TARGET: keyof typeof interfaceInfo;
} = {
	TARGET: 'dingdian',
};
