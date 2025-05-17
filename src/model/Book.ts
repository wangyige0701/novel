import type { Fn } from '@wang-yige/utils';
import type { IDType } from '@/@types';
import { Database, Select, Single } from '@/common/database';
import Book from '@/database/Book';
import BookShelf from '@/database/BookShelf';
import type { BookItemInfo } from '@/@types/pages';
import { useSearchProxyStore } from '@/store/proxy';

@Database('main')
export class BookModel {
	static Book = Book;
	static Bookshelf = BookShelf;

	@Single()
	@Select(`SELECT * FROM ${Book.name} WHERE queryId = ? AND sourceId = ?;`)
	selectById: Fn<[id: IDType, source: number], Promise<any>>;

	@Single('COUNT(1)')
	@Select(`SELECT COUNT(1) FROM ${Book.name} WHERE queryId = ? AND sourceId = ?;`)
	hasBook: Fn<[id: IDType, source: number], Promise<number>>;

	/** 获取所有书架数据 */
	@Select(`SELECT * FROM ${BookShelf.name} ORDER BY id ASC, sort DESC;`)
	getBookshelf: Fn<[], Promise<any[]>>;

	/**
	 * 插入书籍信息，并写入书架
	 */
	async insertBook(data: BookItemInfo) {
		await BookModel.Book.sqlite.beginTransaction();
		try {
			const insert = await new BookModel.Book().open().insert({
				sourceId: useSearchProxyStore().sourceId,
				queryId: data.id,
				name: data.name,
				author: data.author,
				description: data.description,
				img: data.img,
			});
			await new BookModel.Bookshelf().open().insert({
				bookId: insert.lastRowtId,
			});
			await BookModel.Book.sqlite.commitTransaction();
		} catch (error) {
			await BookModel.Book.sqlite.rollbackTransaction();
		}
		new BookModel.Book().close();
	}

	async removeBook(id: IDType) {}
}
