import type { Fn } from '@wang-yige/utils';
import { Database, Select } from '@/common/database';
import Test from '@/database/Test';

@Database('main')
export class TestModel {
	@Select(`SELECT * FROM ${Test.name};`)
	all: Fn<[], Promise<any[]>>;
}
