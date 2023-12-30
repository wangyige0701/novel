/** 配置 */
export const ConfigTarget = {
	test: {
		domain: 'http://127.0.0.1:9999',
		test: '/test',
	},
	dingdian: {
		domain: 'https://m.ytryx.com',
		search: '/search',
	},
} as const;

/** 当前设置 */
export const ConfigSelect: {
	TARGET: keyof typeof ConfigTarget;
} = {
	TARGET: 'dingdian',
	// TARGET: 'test',
};
