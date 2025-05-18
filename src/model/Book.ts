import { isDef, type Fn } from '@wang-yige/utils';
import type { IDType } from '@/@types';
import { Database, Select, Single } from '@/common/database';
import Book from '@/database/Book';
import BookShelf from '@/database/BookShelf';
import type { BookItemInfo } from '@/@types/pages';
import { useSearchProxyStore } from '@/store/proxy';
import Chapter from '@/database/Chapter';

@Database('main')
export class BookModel {
	static Book = Book;
	static Bookshelf = BookShelf;

	@Single()
	@Select(`SELECT * FROM ${Book.name} WHERE query_id = ? AND source_id = ?;`)
	selectById: Fn<[id: IDType, source: number], Promise<any>>;

	@Single('COUNT(1)')
	@Select(`SELECT COUNT(1) FROM ${Book.name} WHERE query_id = ? AND source_id = ?;`)
	hasBook: Fn<[id: IDType, source: number], Promise<number>>;

	/** 获取所有书架数据 */
	@Select(`
		SELECT b.query_id AS id, b.name, b.img, b.author, b.description FROM ${BookShelf.name} AS bs
		LEFT JOIN ${Book.name} AS b ON bs.book_id = b.id
		ORDER BY id ASC, sort DESC;
	`)
	getBookshelf: Fn<[], Promise<any[]>>;

	/**
	 * 从书架移除书籍，同时删除书籍的章节信息和书籍信息
	 */
	async deleteFromBookshelf(queryId: IDType) {
		const book = new BookModel.Book();
		await book.open();
		await BookModel.Book.sqlite.beginTransaction();
		try {
			await BookModel.Book.sqlite.commitTransaction();
			await this.deleteBook(queryId);
			await book.close();
			return true;
		} catch (error) {
			await BookModel.Book.sqlite.rollbackTransaction();
			await book.close();
			return false;
		}
	}

	private async deleteBook(queryId: IDType) {
		const book = new BookModel.Book();
		const query = await book.select({ id: true }, [
			{ type: 'where', value: [`query_id = ${queryId}`, `source_id = ${useSearchProxyStore().sourceId}`] },
		]);
		const id = query[0].id;
		if (isDef(id)) {
			await book.delete(id);
			await this.deleteChapters(id);
			await this.toDeleteFromBookshelf(id);
		}
	}

	private async deleteChapters(bookId: IDType) {
		await new Chapter().open();
		await new Chapter().execute(`DELETE FROM ${Chapter.name} WHERE book_id = ?;`, [bookId]);
	}

	private async toDeleteFromBookshelf(bookId: IDType) {
		await new BookModel.Bookshelf().open();
		const bookshelf = await new BookModel.Bookshelf().select({ id: true }, [
			{ type: 'where', value: [`book_id = ${bookId}`] },
		]);
		const bookshelfId = bookshelf[0].id;
		if (isDef(bookshelfId)) {
			await new BookModel.Bookshelf().delete(bookshelfId);
		}
	}

	/**
	 * 插入书籍信息，并写入书架
	 */
	async insertBook(data: BookItemInfo) {
		const book = new BookModel.Book();
		await book.open();
		await BookModel.Book.sqlite.beginTransaction();
		try {
			const insert = await book.insert({
				sourceId: useSearchProxyStore().sourceId,
				queryId: data.id,
				name: data.name,
				author: data.author,
				description: data.description,
				img: data.img,
			});
			await new BookModel.Bookshelf().open();
			await new BookModel.Bookshelf().insert({
				bookId: insert.lastRowtId,
				sort: 0,
			});
			await BookModel.Book.sqlite.commitTransaction();
		} catch (error) {
			await BookModel.Book.sqlite.rollbackTransaction();
		}
		await book.close();
	}
}
