import { Column, Id, Table, Type } from '@/common/database';
import { BaseTable } from '@/common/database/base';

@Table({ name: 'chapter', disabled: true }, '记录章节信息')
export default class Chapter extends BaseTable<typeof Chapter> {
	@Id()
	@Column()
	id: number;
}
