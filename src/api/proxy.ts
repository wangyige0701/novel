import type { SearchProxy } from '@/@types/api/proxy';

enum SearchProxyKeys {
	dingdian = 'dingdian',
}

export const searchProxy: SearchProxy = {
	local: {
		domain: '/',
		alias: 'novel-search',
		description: '本地代理',
		local: true,
	},
	[SearchProxyKeys.dingdian]: {
		domain: 'https://m.ytryx.com',
		alias: SearchProxyKeys.dingdian,
		description: '顶点小说',
	},
};
