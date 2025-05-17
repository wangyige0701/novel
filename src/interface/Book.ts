import type { IDType } from '@/@types';
import type { BookItemInfo } from '@/@types/pages';
import type { Chapter } from './Chapter';
import { BookModel } from '@/model/Book';
import { isDef, isUndef } from '@wang-yige/utils';

/**
 * 书籍类
 * - 加载章节信息
 */
export abstract class Book {
	private readonly __chapter: Chapter;

	id: IDType;
	name: string;
	img: string;
	author: string;
	description: string;

	constructor(data: BookItemInfo) {
		this.id = data.id;
		this.name = data.name;
		this.img = data.img;
		this.author = data.author;
		this.description = data.description;
		const chapter = this.bindChapter();
		this.__chapter = new chapter(data.id);
	}

	protected abstract bindChapter(): any;

	/**
	 * 初始化并获取所有章节信息
	 * @return 所有章节数组
	 */
	public async getChapters() {
		const chapters = await this.__chapter.init();
		return chapters;
	}

	/**
	 * 获取章节对象实例
	 */
	public get chapter() {
		return this.__chapter;
	}
}
