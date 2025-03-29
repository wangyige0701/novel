import type { Fn } from '@wang-yige/utils';
import { Column, Id, Table, Type } from '@/common/database';
import { describe, it } from 'vitest';
import { BaseTable } from '@/common/database/base';

describe('database', () => {
	function getDescriptor(target: any, key: string) {
		const descriptor = Object.getOwnPropertyDescriptor(target, key);
		if (descriptor) {
			return descriptor;
		}
		Object.defineProperty(target, key, {
			value: void 0,
		});
		return getDescriptor(target, key);
	}

	it('decorate', () => {
		const a = function (target: any) {
			console.log('a');
		};

		@a
		class Test {
			test = 1;
		}
	});

	it('test', () => {
		@Table('test')
		class Test extends BaseTable<typeof Test> {
			@Id()
			@Column()
			id: number;

			@Column({ type: Type.TEXT, name: 'username', nullable: false })
			name: string;
		}

		const test = new Test();
		// @ts-expect-error
		console.log(test.__sql);
		console.log('name: ', Test.name);
		// console.log(Test.sqlite);
	});
});
