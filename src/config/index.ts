export const interfaceInfo = {
	dingdian: {
		domain: 'https://m.ytryx.com/',
		search: 'search',
	},
} as const;

export const NetRequest: {
	TARGET: keyof typeof interfaceInfo;
} = {
	TARGET: 'dingdian',
};
