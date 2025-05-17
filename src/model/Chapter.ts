import type { IDType } from '@/@types';
import type { ChapterType } from '@/@types/interface/boos';
import { Database } from '@/common/database';
import Chapter from '@/database/Chapter';
import { useSearchProxyStore } from '@/store/proxy';
import type { ReadingChapterInfo } from '@/@types/pages/reading';

@Database('main')
export class ChapterModel {
	static Chapter = Chapter;

	/**
	 * 根据章节主键获取章节信息
	 */
	async getChapter(chapterId: IDType): Promise<ReadingChapterInfo | undefined> {
		const chapter = await new ChapterModel.Chapter().sqlstring(`SELECT * FROM ${Chapter.name} WHERE id = ?;`, {
			args: [chapterId],
		});
		if (!chapter.length) {
			return;
		}
		const target = chapter[0];
		return {
			title: target.title,
			contents: target.content,
			hasNext: !!target.nextId,
			hasPrev: !!target.prevId,
			prev: target.prevId,
			next: target.nextId,
		};
	}

	/**
	 * 获取指定书籍的章节列表
	 */
	async getChapterByBookId(bookId: IDType, source: number): Promise<Array<ChapterType & { index: number }>> {
		const datas = await new ChapterModel.Chapter().select(
			{
				id: true,
				queryId: true,
				prevId: true,
				nextId: true,
				title: true,
			},
			[
				{ type: 'where', value: [`book_id = ${bookId}`, `source_id = ${source}`] },
				{ type: 'order', value: { id: 'ASC' } },
			],
		);
		return datas.map(item => {
			return {
				index: item.id,
				id: item.queryId,
				prevId: item.prevId,
				nextId: item.nextId,
				title: item.title,
			};
		});
	}

	/**
	 * 插入指定书籍的章节
	 */
	async insertChapters(bookId: IDType, datas: ChapterType[]) {
		const chapter = new ChapterModel.Chapter();
		await chapter.open();
		await ChapterModel.Chapter.sqlite.beginTransaction();
		const insertIds = [];
		try {
			const sourceId = useSearchProxyStore().sourceId;
			const records = [] as Parameters<typeof chapter.insert>[0];
			for (let index = 0; index < datas.length; index++) {
				const item = datas[index];
				records.push({
					bookId,
					sourceId,
					queryId: item.id,
					title: item.title,
					prevId: item.prevId,
					nextId: item.nextId,
				});
				if (records.length % 100 === 0 || index === datas.length - 1) {
					const inserts = await chapter.insert(records);
					records.length = 0;
					insertIds.push(...inserts.map(i => i.lastRowtId));
				}
			}
			await ChapterModel.Chapter.sqlite.commitTransaction();
		} catch (error) {
			await ChapterModel.Chapter.sqlite.rollbackTransaction();
		}
		await chapter.close();
		return insertIds;
	}
}
