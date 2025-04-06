import type { SearchProxy } from '@/@types/api/proxy';

export enum SearchProxyKeys {
	biqu = 'biqu',
}

export const searchProxy: SearchProxy = {
	local: {
		domain: '/',
		alias: 'novel-search',
		description: '本地代理',
		local: true,
	},
	[SearchProxyKeys.biqu]: {
		domain: 'https://www.xbiqu6.com/',
		alias: SearchProxyKeys.biqu,
		description: '笔趣阁',
	},
};
