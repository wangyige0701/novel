import type { ChapterCallback } from './@types/homepage';
import { ConfigSelect } from '@/config';
import { testRequest } from './__test/testReq';
import { getArticleData, getBookHomeData, getListData } from './dingdian';

/** 搜索方法映射 */
const SEARCH_FUN = {
	test: testRequest,
	dingdian: getListData,
};

/** 主页信息方法映射 */
const BOOK_INFO_FUN = {
	test: testRequest,
	dingdian: function (id: string) {
		return getBookHomeData(id, 'noChapter');
	},
};

/** 图书章节列表方法映射 */
const CHAPTER_LIST_FUN = {
	test: testRequest,
	dingdian: function (id: string, callback?: ChapterCallback, containFirst?: boolean) {
		return getBookHomeData(id, callback, containFirst);
	},
};

/** 小说章节内容方法映射 */
const CONTENT_FUN = {
	test: testRequest,
	dingdian: getArticleData,
};

/** 搜索内容查询 */
export function search(content: string) {
	const _f = SEARCH_FUN[ConfigSelect.TARGET];
	return _f(content);
}

/** 获取小说信息数据 */
export function bookInfo(id: string) {
	const _f = BOOK_INFO_FUN[ConfigSelect.TARGET];
	return _f(id);
}

/** 获取小说章节列表数据 */
export function chapterList(id: string, callback?: ChapterCallback, containFirst?: boolean) {
	const _f = CHAPTER_LIST_FUN[ConfigSelect.TARGET];
	return _f(id, callback, containFirst);
}

/** 获取小说章节内容数据 */
export function article(id: string) {
	const _f = CONTENT_FUN[ConfigSelect.TARGET];
	return _f(id);
}
