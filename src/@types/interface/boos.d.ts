import type { IDType } from '..';

export interface ChapterType {
	id: IDType;
	title: string;
}

export interface BookContentType {
	/** 章节 id */
	id: IDType;
	title: string;
	/** 每个元素是一段内容 */
	contents: string[];
	hasNext: boolean;
	hasPrev: boolean;
	prev?: IDType;
	next?: IDType;
}
