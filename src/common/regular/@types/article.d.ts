import type { HTMLParseTag } from '@common/document/@types/parse';

/**
 * 文章接口处理返回数据
 */
export type ArticleReturnVal = {
	content: string[];
	title: string;
	next_href: string;
	prev_href: string;
};
