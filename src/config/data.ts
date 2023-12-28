/** 配置 */
export const ConfigTarget = {
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
};
