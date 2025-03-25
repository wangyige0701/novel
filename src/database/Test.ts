import { Column, Id, Table, Type } from '@/common/database';

@Table({ name: 'test', test: true }, '测试')
export default class Test {
	@Id()
	@Column('主键')
	id: number;

	@Column({ name: 'name', type: Type.TEXT })
	name: string;
}
