import type { IDType } from '@/@types';
import type { BookContentType } from '@/@types/interface/boos';

/**
 * 内容类
 * @abstract `handleGetContent`
 */
export abstract class Content {
	/**
	 * 根据章节 id 获取书籍章节内容实现
	 */
	protected abstract handleGetContent(chapterId: IDType): Promise<BookContentType>;

	/**
	 * 获取书籍章节内容
	 */
	public async getContent(chapterId: IDType) {
		return await this.handleGetContent(chapterId);
	}
}
