import type { HTMLParseTag } from '@/core/@types/parse';
import { suffixWithPathParam } from '@/api/dingdian/suffix';
import { parseHTML, query, queryAttr, queryText } from '@/core';
import log from '@/log';

type HomePageReturnVal = {
	novelName: string;
	author: {
		name: string;
		href: string | undefined;
	};
	introduction: string;
	novelType: string;
	chaptersList: {
		href: string | undefined;
		name: string;
	}[];
};

/** 信息容器定位 */
const messageBoxSelector = 'div.container > div.row.row-detail > div.layout.layout-col1 > div.detail-box > div.info';

/** 定位获取所有章节元素 */
const getAllChapterSelector = messageBoxSelector + ' > div.top > div.fix > p.opt > a.btn_toBookShelf';

/** 获取小说名 */
const novelNameSelector = messageBoxSelector + ' > div.top > h1';

/** 获取作者名 */
const authorNameSelector = messageBoxSelector + ' > div.top > div.fix > p > a';

/** 获取小说类型 */
const novelTypeSelector = messageBoxSelector + ' > div.top > div.fix > p.xs-show';

/** 获取简介 */
const introductionSelector = messageBoxSelector + ' > div.desc.xs-hidden';

/** 获取所有章节 */
const allChaptersSeelctor =
	'div.container > div.row.row-section > div.layout.layout-col1 > div.section-box > ul.section-list.fix > li > a';

/**
 * 解析获取所有章节的请求路径
 * @param html
 * @returns
 */
function parseGetAllChapterPath(html: string): string | undefined {
	const parse = parseHTML(html);
	const getAllChapter = query(parse).$body().$(getAllChapterSelector);
	if (!getAllChapter) {
		return;
	}
	const target = queryAttr(getAllChapter, 'href');
	if (!target) {
		return;
	}
	return target;
}

/**
 * 获取详细章节数据
 * @param html
 * @returns
 */
function getAllChapters(html: string): undefined | ReturnType<typeof suffixWithPathParam> {
	const path = parseGetAllChapterPath(html);
	if (!path) {
		return;
	}
	return suffixWithPathParam(path);
}

/**
 * 解析主页数据
 * @param html
 * @returns
 */
function handleHomePageHTML(html: string): HomePageReturnVal {
	const parse = parseHTML(html);
	const body = query(parse).$body();
	const novelName = queryText(body.$(novelNameSelector));
	const authorInfo = body.$(authorNameSelector);
	const authorName = queryText(authorInfo);
	const authorHref = queryAttr(authorInfo, 'href');
	const introduction = queryText(body.$(introductionSelector));
	const novelType = queryText(body.$(novelTypeSelector));
	const allChapters = body.$all(allChaptersSeelctor);
	const chaptersList = [];
	for (const item of allChapters) {
		const href = queryAttr(item as HTMLParseTag, 'href');
		const chapterName = queryText(item);
		chaptersList.push({
			href: href,
			name: chapterName,
		});
	}
	return {
		novelName,
		author: {
			name: authorName,
			href: authorHref,
		},
		introduction,
		novelType,
		chaptersList,
	};
}

/**
 * 获取主页展示数据，包括小说名，简介，作者，章节列表
 * @param homeId
 * @returns
 */
export function getHomepageData(homeId: string): Promise<HomePageReturnVal> {
	return new Promise(resolve => {
		suffixWithPathParam(homeId)
			.then(data => {
				return getAllChapters(String(data));
			})
			.then(data => {
				resolve(handleHomePageHTML(String(data)));
			})
			.catch(log.error);
	});
}
