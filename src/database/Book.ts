import { Column, Id, Table, Type } from '@/common/database';
import { BaseTable } from '@/common/database/base';

@Table({ name: 'book', disabled: true }, '记录书籍信息，如作者、描述、名称等')
export default class Book extends BaseTable<typeof Book> {
	@Id()
	@Column('书籍 ID')
	id: number;
}
