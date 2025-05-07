import type { SearchProxy } from '@/@types/api/proxy';

export enum SearchProxyKeys {
	/** 笔趣阁 */
	biqu = 'biqu',
}

export const searchProxy: SearchProxy = {
	[SearchProxyKeys.biqu]: {
		domain: 'https://www.xbiqu6.com/',
		alias: SearchProxyKeys.biqu,
		description: '笔趣阁',
	},
};

export default {
	domain: 'http://127.0.0.1',
	port: 5432,
};
