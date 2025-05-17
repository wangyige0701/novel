import { createPromise, isDef, PromiseReject, PromiseResolve, type Constructor } from '@wang-yige/utils';
import type { IDType } from '@/@types';
import type { ChapterType } from '@/@types/interface/boos';
import type { Content } from './Content';
import type { ReadingChapterInfo } from '@/@types/pages/reading';
import { ChapterModel } from '@/model/Chapter';
import { useSearchProxyStore } from '@/store/proxy';

export type ContentConstructor = Constructor<InstanceType<typeof Content>, ConstructorParameters<typeof Content>>;

type Link = {
	/** 数据库主索引 */
	index: number;
	next: (ChapterType & Link) | undefined;
	prev: (ChapterType & Link) | undefined;
};

/**
 * 章节类
 * - 初始化章节信息，数据库不存在则调用 `handleGetChapters` 创建
 * - 获取指定章节内容，会等待初始化完成
 * @abstract `handleGetChapters`
 */
export abstract class Chapter {
	private readonly __content: Content;
	/** 加载状态等待处理 */
	private __init: {
		promise: Promise<ChapterType[]>;
		resolve: PromiseResolve<ChapterType[]>;
		reject: PromiseReject;
		/** 是否结束初始化 */
		status: boolean;
	};
	/** 书籍 id */
	private bookId: IDType;
	/** 当前章节 id */
	private chapterId: IDType | undefined = void 0;
	/** 书籍章节内容存放数组 */
	private chapterDatas: (ChapterType & Link)[] = [];
	/** 当前 */
	private bookData: ReadingChapterInfo | undefined = void 0;

	constructor(bookId: IDType) {
		this.bookId = bookId;
		this.__init = {
			...createPromise<ChapterType[]>(),
			status: false,
		};
		this.__init.promise.then(res => {
			if (res) {
				this.__init.status = true;
			}
		});
		const content = this.bindContent();
		this.__content = new content();
	}

	/**
	 * 获取内容对象实例
	 */
	public get content() {
		return this.__content;
	}

	protected abstract bindContent(): any;

	/**
	 * 根据书籍 id 获取所有章节信息实现
	 */
	protected abstract handleGetChapters(bookId: IDType): Promise<ChapterType[]>;

	/**
	 * 获取所有章节数据
	 */
	public async getChaptersData() {
		return await this.__init.promise;
	}

	/**
	 * 等待初始化完成
	 */
	public async wait() {
		return await this.__init.promise;
	}

	/**
	 * 初始化章节信息
	 */
	public async init(index = 0) {
		if (this.__init.status) {
			return await this.__init.promise;
		}
		let datas = await new ChapterModel().getChapterByBookId(this.bookId, useSearchProxyStore().sourceId);
		if (!datas.length) {
			const gets = (await this.handleGetChapters(this.bookId)) || [];
			const insertIds = await new ChapterModel().insertChapters(this.bookId, gets);
			datas = gets.map((item, inedx) => {
				return { ...item, index: insertIds[inedx] };
			});
		}
		this.chapterDatas.length = 0;
		for (const [i, item] of datas.entries()) {
			this.chapterDatas.push({
				...item,
				// @ts-expect-error
				prev: datas[i - 1],
				// @ts-expect-error
				next: datas[i + 1],
			});
		}
		this.__init.resolve(
			this.chapterDatas.map(item => ({
				...item,
			})),
		);
		this.chapterId = datas[Math.max(0, index)]?.index;
		if (isDef(this.chapterId)) {
			this.bookData = await this.getContent(this.chapterId);
		}
		return await this.__init.promise;
	}

	/**
	 * 获取章节内容数据
	 */
	public async getContent(chapterId: IDType) {
		await this.__init.promise;
		if (this.chapterId === chapterId) {
			return this.bookData;
		}
		this.chapterId = chapterId;
		this.bookData = await this.__content.getContent(chapterId);
		return this.bookData;
	}

	/**
	 * 获取下一章内容
	 */
	public async getNext() {
		await this.__init.promise;
		if (this.bookData && this.bookData.hasNext && this.current?.next) {
			return await this.getContent(this.current.next.index);
		}
		return null;
	}

	/**
	 * 获取上一章内容
	 */
	public async getPrev() {
		await this.__init.promise;
		if (this.bookData && this.bookData.hasPrev && this.current?.prev) {
			return await this.getContent(this.current.prev.index);
		}
		return null;
	}

	private get current() {
		return this.chapterDatas.find(item => item.id === this.chapterId);
	}
}
