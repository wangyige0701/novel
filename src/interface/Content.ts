import type { IDType } from '@/@types';
import type { ReadingChapterInfo } from '@/@types/pages/reading';
import { ChapterModel } from '@/model/Chapter';

/**
 * 内容类
 * @abstract `handleGetContent`
 */
export abstract class Content {
	/**
	 * 根据章节 id 获取书籍章节内容实现
	 */
	protected abstract handleGetContent(chapterId: IDType): Promise<ReadingChapterInfo>;

	/**
	 * 获取书籍章节内容
	 */
	public async getContent(chapterId: IDType) {
		let content = await new ChapterModel().getChapter(chapterId);
		if (!content) {
			content = await this.handleGetContent(chapterId);
			await new ChapterModel.Chapter().update(chapterId, {
				content: JSON.stringify(content.contents),
				contentLength: content.contents.reduce((prev, curr) => {
					return prev + curr.length;
				}, 0),
			});
		}
		return content;
	}
}
