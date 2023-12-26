import type { HTMLParse } from '@/core/@types/parse';
import type { ArticleReturnVal } from '../@types/article';
import { suffixWithPathParam } from '@/api/dingdian/suffix';
import { parseHTML, query, queryAttr, queryText } from '@/core';

enum URLType {
	/** 改变页数 */
	CHANGE_PAGE = 0,
	/** 改变章节 */
	CHANGE_CHAPTER = 1,
	/** 没有下一节，回主页 */
	RETURN_HOME = 2,
}

/** 匹配文章id信息 */
const matchArticleInfo = /^.*\/(\d+)(?:_(\d+))?.html$/;

const containerSeelctor = 'div#container > div.row.row-detail.row-reader div.layout.layout-col1 > div.reader-main';

const nextSelector = containerSeelctor + ' > div.section-opt > a#next_url';

const prevSelector = containerSeelctor + ' > div.section-opt > a#prev_url';

const titleSelector = containerSeelctor + ' > h1.title';

const contentSelector = containerSeelctor + ' > div#content > *';

/**
 * url状态判断
 * @param url
 * @param nowId
 * @returns
 */
function handleUrl(url: string, nowId: string) {
	const match = url.match(matchArticleInfo);
	if (!match) {
		return URLType.RETURN_HOME;
	}
	const [_, articleId, page] = match;
	if (articleId === nowId) {
		return URLType.CHANGE_PAGE;
	}
	return URLType.CHANGE_CHAPTER;
}

/**
 * 移除标题后缀
 * @param title
 * @returns
 */
function removePageInTitle(title: string) {
	const match = title.match(/([\w\W]*)(?:(\d+)\/(\d+))/);
	if (!match) {
		return title.trim();
	}
	const splitTitle = match[1].trim();
	const nowPage = parseInt(match[2]);
	const totalPage = parseInt(match[3]);
	if (nowPage > totalPage) {
		return removePageInTitle(
			`${splitTitle}${nowPage.toString().slice(0, 1)} ${nowPage.toString().slice(1)}/${totalPage}`,
		);
	}
	return splitTitle;
}

/**
 * 判断是否需要获取下一页数据
 * @param prev
 * @param nowId
 * @returns
 */
function handleNeedNextPage(prev: string, nowId: string) {
	const state = handleUrl(prev, nowId);
	if (state === URLType.CHANGE_CHAPTER || state === URLType.RETURN_HOME) {
		return false;
	}
	return true;
}

/**
 * 判断是否是小说章节边界
 * @param prev_next
 * @returns
 */
function handleEnd(prev_next: string) {
	return handleUrl(prev_next, '') === URLType.RETURN_HOME;
}

/**
 * 将文本树的文本内容解析出来
 * @param content
 * @returns
 */
function parseContentTree(content: HTMLParse[]) {
	let result: string[] = [];
	for (const item of content) {
		const text = queryText(item);
		if (text) {
			result.push(text);
		}
	}
	return result;
}

/**
 * 解析小说html页面
 * @param html
 * @param nowId
 * @returns
 */
async function parseHTMLString(html: string, nowId: string): Promise<ArticleReturnVal> {
	const parse = parseHTML(html);
	const body = query(parse);
	const next_but = body.$(nextSelector);
	const prev_but = body.$(prevSelector);
	const content = parseContentTree(body.$all(contentSelector));
	const title = queryText(body.$(titleSelector));
	const prev_href = queryAttr(prev_but, 'href');
	let next_href = queryAttr(next_but, 'href');
	const need_next_page = handleNeedNextPage(next_href, nowId);
	if (need_next_page) {
		// 判断是否需要请求下一页数据
		const next_data = await getArticleData(next_href);
		content.push(...next_data.content);
		next_href = next_data.next_href;
	}
	const prev_end = handleEnd(prev_href);
	const next_end = handleEnd(next_href);
	return {
		title: removePageInTitle(title),
		next_href: next_end ? '' : next_href,
		prev_href: prev_end ? '' : prev_href,
		content,
	};
}

/**
 * 获取文章数据
 * @param articlePath
 * @returns
 */
export function getArticleData(articlePath: string): Promise<ArticleReturnVal> {
	return new Promise((resolve, reject) => {
		const match = articlePath.match(matchArticleInfo);
		const [_, articleId] = match || [];
		suffixWithPathParam(articlePath)
			.then(data => {
				return parseHTMLString(String(data), articleId);
			})
			.then(res => {
				resolve(res);
			})
			.catch(reject);
	});
}
