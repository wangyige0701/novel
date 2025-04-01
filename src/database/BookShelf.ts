import { Column, Id, Table, Type } from '@/common/database';
import { BaseTable } from '@/common/database/base';

@Table({ name: 'book_shelf', disabled: true }, '记录书架数据')
export default class BookShelf extends BaseTable<typeof BookShelf> {
	@Id()
	@Column()
	id: number;
}
