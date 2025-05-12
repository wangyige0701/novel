import type { BookItemInfo } from '@/@types/pages';
import { isNumber } from '@wang-yige/utils';
import { BiquBook } from './Book';
import { Bookshelf } from '@/interface/Bookshelf';
import { book, search } from '@/api/biqu';
import { parseBookInfoHtml, parseSearchHtml } from '@/parse/biqu';

export class BiquBookshelf extends Bookshelf {
	protected async handleSearch(keyword: string, page?: number, _prevPage?: number) {
		if (isNumber(page) && page > 1) {
			// 笔趣阁查询结果没有分页
			return [];
		}
		const html = await search(keyword)
			.then(res => res as string)
			.catch(() => '');
		return parseSearchHtml(html);
	}

	protected async handleSelectBook(target: BookItemInfo) {
		const html = await book(target.id)
			.then(res => res as string)
			.catch(() => '');
		return {
			...target,
			...parseBookInfoHtml(html),
		};
	}

	protected bindBook() {
		return BiquBook;
	}
}
