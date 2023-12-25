type BookListType = {
	/** 小说名 */
	name: string;
	/** 小说路径 */
	href: string;
	/** 作者名 */
	author: string;
	/** 图片路径 */
	img?: string;
	/** 小说分类 */
	type: string;
};

type BookListClickType = {
	name: string;
	href: string;
};
