import { Column, Id, Table, Type } from '@/common/database';
import { BaseTable } from '@/common/database/base';

@Table(
	{
		name: 'chapter',
		disabled: import.meta.env.DEV,
		indexs: [{ name: 'idx_book_source', columns: ['book_id', 'source_id'] }],
	},
	'记录章节信息',
)
export default class Chapter extends BaseTable<typeof Chapter> {
	@Id()
	@Column('章节主键')
	id: number;

	@Column({ name: 'book_id', type: Type.INTEGER, nullable: false }, '所属书籍 id')
	bookId: number;

	@Column({ name: 'source_id', type: Type.INTEGER, nullable: false }, '章节来源，记录编号')
	sourceId: number;

	@Column({ name: 'prev_id', type: Type.INTEGER }, '上一个章节 id')
	prevId: number;

	@Column({ name: 'next_id', type: Type.INTEGER }, '下一个章节 id')
	nextId: number;

	@Column({ type: Type.TEXT }, '章节标题')
	title: string;

	@Column({ type: Type.TEXT }, '章节内容')
	content: string;

	@Column({ name: 'content_length', type: Type.INTEGER, default: 0 }, '章节内容长度')
	contentLength: number;

	@Column({ name: 'create_time', type: Type.DATETIME, dltVal: () => new Date().toISOString() }, '创建时间')
	createTime: string;
}
