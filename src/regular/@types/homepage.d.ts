/**
 * 主页数据处理返回类型
 */
export type HomePageReturnVal = {
	/** 小说名 */
	novelName: string;
	/** 作者信息 */
	author: {
		/** 作者名 */
		name: string;
		/** 作者主页路径 */
		href: string | undefined;
	};
	/** 简介 */
	introduction: string;
	/** 小说类型 */
	novelType: string;
	/** 章节列表信息 */
	chaptersList: {
		/** 章节对应路径 */
		href: string | undefined;
		/** 章节名 */
		name: string;
	}[];
	/** 分页数量 */
	pageNumber: number;
};

/** 章节列表类型 */
export type ChapterList = HomePageReturnVal['chaptersList'];

/** 章节数据更新回调函数 */
export type ChapterCallback = (chapter?: ChapterList, err?: any) => void;
