import type { Clz, IDType } from '@/@types';
import type { Chapter } from './Chapter';
import type { Content } from './Content';
import { Book } from './Book';
import { BookItemInfo } from '@/@types/pages';

type BookConstructor = Clz<typeof Book>;
type ChapterConstructor = Clz<typeof Chapter>;
type ContentConstructor = Clz<typeof Content>;

/**
 * 书架类
 * - 新增书籍
 * - 删除书籍
 * - 查询书籍
 * - 搜索书籍
 * - 查看书籍 -> 调用书籍类
 * @abstract `handleSearch`
 */
export abstract class Bookshelf {
	/** `Chapter` 类 */
	private __chapter: ChapterConstructor;
	/** `Book` 类 */
	private __book: BookConstructor;
	/** `Content` 类 */
	private __content: ContentConstructor;
	/** 书架中的书籍列表 */
	private books: Book[] = [];
	/** 查询的书籍列表 */
	private searchDatas: Book[] = [];
	/** 当前查看的书籍 */
	private selectBook: Book | null = null;

	constructor(chapter: ChapterConstructor, content: ContentConstructor) {
		this.__book = Book;
		this.__chapter = chapter;
		this.__content = content;
		// 实现数据库读取书架内容
	}

	/**
	 * 搜索方法实现
	 */
	protected abstract handleSearch(keyword: string): Promise<Book[]>;

	/**
	 * 触发搜索
	 */
	public async search(keyword: string) {
		const result = await this.handleSearch(keyword);
		this.searchDatas.splice(0, this.searchDatas.length, ...result);
		return this.searchDatas;
	}

	/**
	 * 书架插入书籍
	 */
	public add(data: Book) {
		if (data && !this.books.find(item => String(item.id) === String(data.id))) {
			this.books.push(data);
		}
		return this;
	}

	/**
	 * 包装书籍对象
	 */
	public book(data: BookItemInfo) {
		return new this.__book(data);
	}

	/**
	 * 书架移除书籍
	 */
	public remove(id: IDType) {
		this.books.splice(
			this.books.findIndex(item => String(item.id) === String(id)),
			1,
		);
		return this;
	}

	/**
	 * 获取当前书架的书籍列表
	 */
	public get datas() {
		return this.books;
	}

	/**
	 * 选择一本书
	 */
	public async select(id: IDType) {
		const target = this.books.find(item => String(item.id) === String(id));
		if (!target) {
			return null;
		}
		this.selectBook = new this.__book(target);
		const chapter = new this.__chapter(id);
		const content = new this.__content();
		Object.defineProperty(chapter, '__content', {
			get: () => content,
		});
		Object.defineProperty(this.selectBook, '__chapter', {
			get: () => chapter,
		});
		await this.selectBook.getChapters();
		return this.selectBook;
	}
}
