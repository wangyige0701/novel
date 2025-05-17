import type { ReadingChapterInfo } from '@/@types/pages/reading';
import type { SearchBookInfo } from '@/@types/pages/search';
import type { BookItemInfo } from '@/@types/pages';
import type { ChapterType } from '@/@types/interface/boos';
import { parse } from '@/common/document';
import { Request } from '@/common/request';
import { delay, type Fn, ParallelTask } from '@wang-yige/utils';
import { useSearchProxyStore as proxy } from '@/store/proxy';

/**
 * 解析笔趣阁搜索结果
 */
export function parseSearchHtml(html: string): BookItemInfo[] {
	const lists = parse(html).$$('.container .row ul.txt-list.txt-list-row5 > li');
	const result = lists
		.filter((_, i) => i > 0)
		.map(item => {
			const author = item.$('span.s1').text();
			const nameA = item.$('span.s2 a');
			const chapter = item.$('span.s3 a').text();
			const name = nameA.text();
			const url = nameA.attr('href');
			return {
				id: url,
				name,
				author,
				img: '',
				description: `最新章节：${chapter}`,
			};
		});
	return result;
}

/**
 * 解析笔趣阁书籍详情
 */
export function parseBookInfoHtml(html: string): SearchBookInfo {
	const h = parse(html);
	const info = h.$('.container div.row.row-detail .detail-box');
	const infoContainer = h.$('.info');
	const img = info.$('.imgbox img').attr('src');
	const name = infoContainer.$('.top > h1').text();
	const author = infoContainer.$('.top > div.fix > p > a').text();
	const description = infoContainer.$('.desc > p').text();
	return {
		img,
		name,
		author,
		description,
	};
}

/**
 * 解析书籍章节列表，自动获取所有章节
 */
export async function parseBookChaptersHtml(
	html: string,
	progress?: Fn<[number: number, total: number]>,
): Promise<ChapterType[]> {
	let page = 1;
	let h = parse(html);
	let prev: ChapterType;
	let chapters = h.$('.container div.row.row-section');
	const chapterLists = chapters.$$('.listpage span.middle > select > option');
	const _l = (html?: string, index = page) => {
		if (progress) {
			progress(index, chapterLists.length);
		}
		h = html ? parse(html) : h;
		chapters = html ? h.$('.container div.row.row-section') : chapters;
		const li = chapters.$$('.section-box')[1];
		if (!li) {
			return [];
		}
		return li.$$('ul li').map(item => {
			const chapter = item.$('a');
			const url = chapter.attr('href');
			const name = chapter.text();
			prev && (prev.nextId = url);
			prev = {
				id: url,
				title: name,
				prevId: prev?.id,
				nextId: void 0,
			};
			return prev;
		});
	};
	const lists = _l();
	const task = new ParallelTask(2);
	const promise = chapterLists.map(item => {
		const index = ++page;
		const src = item.attr('value');
		const _r = async (count = 0): Promise<string> => {
			await delay(300);
			const html = await Request.get(proxy().path + src)
				.then(res => {
					return res as string;
				})
				.catch(() => {
					if (count < 3) {
						return _r(count + 1);
					}
				});
			return html || '';
		};
		return task.add(async () => {
			const html = await _r();
			return html ? _l(html, index) : [];
		});
	});
	const others = await Promise.all(promise);
	others.forEach(list => {
		lists.push(...list);
	});
	return lists;
}

/**
 * 解析章节数据，会自动处理分页
 */
export async function parseChapterHtml(html: string): Promise<ReadingChapterInfo> {
	const match = /\/book\/[^/]+\/(?<chapterId>[^/]+).html$/;
	let h = parse(html);
	let container = h.$('.container div.row.row-detail.row-reader .reader-main');
	let option = container.$('div.section-opt');
	const title = container.$('h1.title').text();
	const contents = container.$$('div.content > p').map(item => {
		return item.text();
	});
	// 上一章
	const prev = option.$('a#prev_url').attr('href');
	let hasPrev = true;
	if (!match.test(prev)) {
		hasPrev = false;
	}
	const _checkNext = async (html?: string) => {
		h = html ? parse(html) : h;
		container = html ? h.$('.container div.row.row-detail.row-reader .reader-main') : container;
		option = html ? container.$('div.section-opt') : option;
		const contents = container.$$('div.content > p').map(item => {
			return item.text();
		});
		let next = option.$('a#next_url').attr('href');
		let hasNext = true;
		if (match.test(next)) {
			const target = next.match(match)?.groups?.chapterId || '';
			if (target.includes('_')) {
				// 需要查询下一页数据
				const _r = async (count = 0): Promise<string> => {
					const html = await Request.get(proxy().path + next)
						.then(res => {
							return res as string;
						})
						.catch(() => {
							if (count < 3) {
								return _r(count + 1);
							}
						});
					return html || '';
				};
				const nextContent = await _r();
				if (nextContent) {
					const { contents: _contents, hasNext: _hasNext, next: _next } = await _checkNext(nextContent);
					contents.push(..._contents);
					hasNext = _hasNext as boolean;
					next = _next;
				}
				return { contents, hasNext, next };
			}
		} else {
			hasNext = false;
		}
		return { contents, hasNext, next };
	};
	const { contents: _contents, hasNext, next } = await _checkNext();
	contents.push(..._contents);
	return { title, contents, hasPrev, prev, hasNext, next };
}
