import { Column, Id, Table, Type } from '@/common/database';
import { BaseTable } from '@/common/database/base';

@Table({ name: 'test', test: true }, '测试')
export default class Test extends BaseTable<typeof Test> {
	@Id()
	@Column('主键')
	id: number;

	@Column({ name: 'name', type: Type.TEXT }, '姓名')
	name: string;

	/**
	 * 性别，0：男，1：女
	 */
	@Column({ name: 'gender', type: Type.INTEGER, default: 0 }, '性别')
	gender: number;
}
