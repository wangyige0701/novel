import SQLite from '@/common/database/SQLite';
import { Constructor, Fn } from '@wang-yige/utils';

type Clz = {
	__create: Fn<[], Promise<false | void>>;
	__sql: string;
	__info: () => {
		name: string;
		path: string;
		table: string;
	};
};

/**
 * 加载数据表
 */
export async function loadDatabase() {
	if (!SQLite.usable) {
		return false;
	}
	const configs = import.meta.glob('../database/*.ts', {
		eager: true,
		import: 'default',
	});
	for (const key in configs) {
		const clz = configs[key] as Constructor<Clz>;
		const ins = new clz();
		const { path, table, name } = ins.__info();
		try {
			const result = await ins.__create();
			if (result !== false) {
				console.log(`[Success] 数据表 ${path} [${name}] --> ${table} SQL 执行成功：\n${ins.__sql}`);
			}
		} catch (error: any) {
			console.log(`[Error] 数据表 ${path} [${name}] --> ${table} SQL 执行异常：\n${error.message}\n${ins.__sql}`);
		}
	}
}
