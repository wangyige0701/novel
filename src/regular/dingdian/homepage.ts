import type { HTMLParseTag } from '@/core/@types/parse';
import { suffixWithPathParam } from '@/api/dingdian/suffix';
import { parseHTML, query, queryAttr, queryText } from '@/core';
import { RequestQueue } from '@/utils/requestQueue';

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
	allPage: number;
};

type ChapterList = HomePageReturnVal['chaptersList'];

type ChapterCallback = (chapter?: ChapterList, err?: any) => void;

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

const chapterBox = 'div.container > div.row.row-section > div.layout.layout-col1';

/** 获取所有章节 */
const allChaptersSeelctor = chapterBox + ' > div.section-box > ul.section-list.fix > li > a';

/** 获取分页数据 */
const pagesSelector = chapterBox + ' > div.index-container > select#indexselect > option';

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

function getChaptersData(chaptersData: HTMLParseTag[]) {
	const chaptersList: ChapterList = [];
	for (const item of chaptersData) {
		const href = queryAttr(item as HTMLParseTag, 'href');
		const chapterName = queryText(item);
		chaptersList.push({
			href: href,
			name: chapterName,
		});
	}
	return chaptersList;
}

function getPagesDataAndParse(path: string) {
	return new Promise<ChapterList>((_resolve, _reject) => {
		suffixWithPathParam(path)
			.then(data => {
				_resolve(
					getChaptersData(
						query(parseHTML(String(data)))
							.$body()
							.$all(allChaptersSeelctor),
					),
				);
			})
			.catch(_reject);
	});
}

/**
 * 整合分页数据，异步请求获取
 */
function mergePagingChapters(
	pages: HTMLParseTag[],
	nowChapterData: HTMLParseTag[],
	chaptersRefresh?: ChapterCallback,
): Promise<ChapterList> {
	return new Promise<ChapterList>(resolve => {
		const allPages = pages.length;
		if (allPages === 0) {
			return resolve([]);
		}
		const { index: positionIndex } = query(pages).$('option[selected="selected"]', true);
		const requestQueue = new RequestQueue<ChapterList>();
		/** 缓存数据，使数据按顺序调用回调函数 */
		const cache = new Map<number, ChapterList>();
		let index = 0;
		/** 数据发送顺序判断 */
		function _c(data: ChapterList, indexVal: number, recursive: boolean = true) {
			if (index === indexVal) {
				if (index === 0) {
					resolve(data);
				} else {
					chaptersRefresh?.(data);
				}
				index++;
				return true;
			} else {
				cache.set(indexVal, data);
				if (!recursive) {
					return false;
				}
				for (const __i of cache.keys()) {
					const state = _c(cache.get(__i)!, __i, false);
					if (state === true) {
						cache.delete(__i);
					}
				}
			}
		}
		// 遍历通过请求队列获取所有数据
		for (let i = 0; i < allPages; i++) {
			if (i === positionIndex) {
				_c(getChaptersData(nowChapterData), i);
				continue;
			}
			const _i = i;
			const target = pages[_i];
			const href = queryAttr(target, 'value');
			requestQueue
				.add(getPagesDataAndParse.bind(null, href))
				.then(val => {
					_c(val, _i);
				})
				.catch(err => {
					chaptersRefresh?.(void 0, err);
				});
		}
	});
}

/**
 * 解析主页数据
 * @param html
 * @returns
 */
async function handleHomePageHTML(html: string, chaptersRefresh?: ChapterCallback): Promise<HomePageReturnVal> {
	const parse = parseHTML(html);
	const body = query(parse).$body();
	const novelName = queryText(body.$(novelNameSelector));
	const authorInfo = body.$(authorNameSelector);
	const authorName = queryText(authorInfo);
	const authorHref = queryAttr(authorInfo, 'href');
	const introduction = queryText(body.$(introductionSelector));
	const novelType = queryText(body.$(novelTypeSelector));
	const pageDatas = body.$all(pagesSelector);
	const allChapters = body.$all(allChaptersSeelctor);
	const chaptersList = await mergePagingChapters(pageDatas, allChapters, chaptersRefresh);
	return {
		novelName,
		author: {
			name: authorName,
			href: authorHref,
		},
		introduction,
		novelType,
		chaptersList,
		allPage: pageDatas.length,
	};
}

/**
 * 获取主页展示数据，包括小说名，简介，作者，章节列表
 * @param homeId
 * @returns
 */
export function getHomepageData(homeId: string, chaptersRefresh?: ChapterCallback): Promise<HomePageReturnVal> {
	return new Promise((resolve, reject) => {
		suffixWithPathParam(homeId)
			.then(data => {
				return getAllChapters(String(data));
			})
			.then(data => {
				return handleHomePageHTML(String(data), chaptersRefresh);
			})
			.then(resolve)
			.catch(reject);
	});
}
