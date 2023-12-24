import type { HTMLParseTag } from '@/core/@types/parse';

/**
 * 文章接口处理返回数据
 */
export type ArticleReturnVal = {
	content: HTMLParseTag[];
	title: string;
	next_href: string;
	prev_href: string;
};
