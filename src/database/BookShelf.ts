import { Column, Id, Table, Type } from '@/common/database';
import { BaseTable } from '@/common/database/base';

@Table({ name: 'book_shelf', disabled: import.meta.env.DEV }, '记录书架数据')
export default class BookShelf extends BaseTable<typeof BookShelf> {
	@Id()
	@Column('书架主键')
	id: number;

	@Column({ name: 'book_id', type: Type.INTEGER, nullable: false }, '书籍 id')
	bookId: number;

	@Column({ type: Type.INTEGER, nullable: false, default: 0, unique: true }, '排序')
	sort: number;

	@Column({ name: 'create_time', type: Type.DATETIME }, '创建时间')
	createTime: Date;
}
