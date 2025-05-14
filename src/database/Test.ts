import { Column, Id, Table, Type } from '@/common/database';
import { BaseTable } from '@/common/database/base';

@Table(
	{
		name: 'test',
		test: true,
		indexs: [
			{ name: 'idx_level', columns: ['level_id'] },
			{ name: 'idx_card', columns: ['id_card'], unique: true },
		],
		disabled: import.meta.env.PROD,
	},
	'测试',
)
export default class Test extends BaseTable<typeof Test> {
	@Id()
	@Column('主键')
	id: number;

	@Column({ name: 'name', type: Type.TEXT }, '姓名')
	name: string;

	@Column({ name: 'gender', type: Type.INTEGER, nullable: false, default: 0 }, '性别；0：男，1：女')
	gender: number;

	@Column({ name: 'id_card', type: Type.TEXT, unique: true, nullable: false }, '身份证')
	idCard: string;

	@Column({ name: 'level_id', type: Type.INTEGER, nullable: true }, '等级')
	levelId: number;

	@Column({ name: 'create_time', type: Type.DATETIME }, '创建时间')
	createTime: Date;

	@Column({ name: 'timestamp', type: Type.TIMESTAMP }, '时间戳存储')
	timestamp: Date;

	@Column({ name: 'binary', type: Type.BLOB }, '二进制数据')
	binary: Uint8Array<ArrayBuffer>;
}
