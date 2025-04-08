import { Column, Id, Table, Type } from '@/common/database';
import { BaseTable } from '@/common/database/base';

@Table(
	{
		name: 'book',
		disabled: import.meta.env.DEV,
		indexs: [{ name: 'source_id', columns: ['source_id'] }],
	},
	'记录书籍信息，如作者、描述、名称等',
)
export default class Book extends BaseTable<typeof Book> {
	@Id()
	@Column('书籍 id')
	id: number;

	@Column({ name: 'source_id', type: Type.INTEGER, nullable: false }, '书籍来源 id')
	sourceId: number;

	@Column({ type: Type.TEXT, nullable: false }, '书籍名称')
	name: string;

	@Column({ type: Type.TEXT }, '作者')
	author: string;

	@Column({ type: Type.TEXT }, '书籍描述')
	description: string;

	@Column({ type: Type.TEXT }, '书籍封面图片地址')
	img: string;

	@Column({ name: 'create_time', type: Type.DATETIME }, '创建时间')
	createTime: Date;

	@Column({ name: 'update_time', type: Type.DATETIME }, '更新时间')
	updateTime: Date;
}
