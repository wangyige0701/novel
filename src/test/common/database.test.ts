import { Column, Id, Table, Type } from '@/common/database';
import { describe, it } from 'vitest';

describe('database', () => {
	it('test', () => {
		@Table('test')
		class Test {
			@Id()
			@Column()
			id: number;

			@Column({ type: Type.TEXT, name: 'username', nullable: false })
			name: string;
		}

		const test = new Test();
		// @ts-expect-error
		console.log(test.__sql);
	});
});
