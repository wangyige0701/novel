import { ConfigSelect } from '@/config';
import { getArticleData, getBookHomeData, getListData } from './dingdian';

/** 搜索方法映射 */
const SEARCH_FUN = {
	dingdian: getListData,
};

/** 图书主页数据方法映射 */
const BOOK_HOME_FUN = {
	dingdian: getBookHomeData,
};

/** 小说章节内容方法映射 */
const CONTENT_FUN = {
	dingdian: getArticleData,
};

/** 搜索内容查询 */
export function search(content: string) {
	const _f = SEARCH_FUN[ConfigSelect.TARGET];
	return _f(content);
}

/** 获取小说主页数据 */
export function bookHome(id: string) {
	const _f = BOOK_HOME_FUN[ConfigSelect.TARGET];
	return _f(id);
}

/** 获取小说章节内容数据 */
export function article(id: string) {
	const _f = CONTENT_FUN[ConfigSelect.TARGET];
	return _f(id);
}
