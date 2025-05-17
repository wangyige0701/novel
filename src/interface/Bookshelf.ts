import type { Clz, IDType } from '@/@types';
import type { BookItemInfo } from '@/@types/pages';
import { Book } from './Book';
import { BookModel } from '@/model/Book';
import { useSearchProxyStore } from '@/store/proxy';

type BookConstructor = Clz<typeof Book>;

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
	/** `Book` 类 */
	private __book: BookConstructor;
	/** 书架中的书籍列表 */
	private books: Book[] = [];
	/** 查询的书籍列表 */
	private searchDatas: BookItemInfo[] = [];
	/** 当前查看的书籍 */
	private selectBook: Book | null = null;

	constructor() {
		// 实现数据库读取书架内容
		this.__book = this.bindBook();
	}

	protected abstract bindBook(): any;

	/**
	 * 搜索方法实现
	 * @param keyword 搜索关键词
	 * @param page 页码
	 * @param prevPage 上一页页码，在不能直接通过接口传递页码时判断触发上一页还是下一页
	 */
	protected abstract handleSearch(keyword: string, page?: number, prevPage?: number): Promise<BookItemInfo[]>;

	/**
	 * 在选择书之前处理数据，填入正确书籍信息
	 */
	protected abstract handleAddBook(target: BookItemInfo): Promise<BookItemInfo>;

	private searchKeyword: string;
	private page: number = 1;

	/**
	 * 初始化书架信息
	 */
	public async init() {
		const datas = await new BookModel().getBookshelf();
		this.books.splice(0, this.books.length, ...datas);
	}

	/**
	 * 搜索行为处理
	 */
	private async __search(keyword: string, prevPage?: number) {
		const result = await this.handleSearch(keyword, this.page, prevPage);
		this.searchDatas.splice(0, this.searchDatas.length, ...result);
		return this.searchDatas;
	}

	/**
	 * 触发搜索
	 */
	public async search(keyword: string, page?: number) {
		this.searchKeyword = keyword;
		this.page = page || 1;
		if (this.page <= 0) {
			this.page = 1;
		}
		return await this.__search(keyword, this.page);
	}

	/**
	 * 搜索下一页
	 */
	public async searchNext() {
		const prev = this.page;
		this.page++;
		return await this.__search(this.searchKeyword, prev);
	}

	/**
	 * 搜索上一页
	 */
	public async searchPrev() {
		const prev = this.page;
		this.page--;
		if (this.page <= 0) {
			this.page = 1;
		}
		return await this.__search(this.searchKeyword, prev);
	}

	/**
	 * 书架插入书籍
	 */
	public async add(data: BookItemInfo) {
		const book = new BookModel();
		if (!(await book.hasBook(data.id, useSearchProxyStore().sourceId))) {
			data = await this.handleAddBook(data);
			await book.insertBook(data);
		}
		if (data && !this.books.find(item => String(item.id) === String(data.id))) {
			this.books.push(this.book(data));
		}
		return this;
	}

	/**
	 * 包装书籍对象
	 */
	private book(data: BookItemInfo) {
		return new this.__book(data);
	}

	/**
	 * 书架移除书籍
	 */
	public async remove(id: IDType) {
		const result = await new BookModel().deleteFromBookshelf(id);
		if (result) {
			this.books.splice(
				this.books.findIndex(item => String(item.id) === String(id)),
				1,
			);
		}
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
	public select(id: IDType) {
		const target = this.books.find(item => String(item.id) === String(id));
		if (!target) {
			return null;
		}
		this.selectBook = target;
		return this.selectBook;
	}
}
