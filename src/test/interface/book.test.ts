import { IDType } from '@/@types';
import { BookContentType, ChapterType } from '@/@types/interface/boos';
import { BookItemInfo } from '@/@types/pages';
import { Book } from '@/interface/Book';
import { Bookshelf } from '@/interface/Bookshelf';
import { Chapter } from '@/interface/Chapter';
import { Content } from '@/interface/Content';
import { describe, expect, it } from 'vitest';

describe('Book', () => {
	class BookshelfTest extends Bookshelf {
		protected handleSearch(keyword: string): Promise<Book[]> {
			console.log(`查询 ${keyword}`);
			return Promise.resolve([this.book(bookInfo)]);
		}
	}

	class ChapterTest extends Chapter {
		protected handleGetChapters(bookId: IDType): Promise<ChapterType[]> {
			console.log(`获取章节`);
			return Promise.resolve([{ id: String(bookId), title: '第一章' }]);
		}
	}

	class ContentTest extends Content {
		protected handleGetContent(chapterId: IDType): Promise<BookContentType> {
			console.log(`获取内容`);
			return Promise.resolve({
				id: '1',
				title: '标题',
				content: ['第一段'],
				hasNext: false,
				hasPrev: false,
			});
		}
	}

	const bookshelf = new BookshelfTest(ChapterTest, ContentTest);
	const bookInfo = {
		id: '1',
		name: '书籍1',
		img: 'https://picsum.photos/70/90',
		author: '作者1',
		description: '书籍1的描述',
	} satisfies BookItemInfo;

	it('use bookshelf', async () => {
		const searchValue = await bookshelf.search('keyword');
		expect(searchValue).toEqual([bookInfo]);

		bookshelf.add(bookshelf.book(bookInfo));
		expect(bookshelf.datas).toEqual([bookshelf.book(bookInfo)]);

		const selectBook = await bookshelf.select(1);
		expect(selectBook?.name).toBe('书籍1');
		if (selectBook) {
			const chapter = selectBook.chapter;
			expect(await selectBook.getChapters()).toEqual([{ id: '1', title: '第一章' }]);
			expect(await chapter.getChaptersData()).toEqual([{ id: '1', title: '第一章' }]);
			expect(await chapter.getNext()).toBeNull();
		}
		bookshelf.remove(1);
		expect(bookshelf.datas).toEqual([]);
	});
});
