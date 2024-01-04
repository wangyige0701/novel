import type { InjectionKey } from 'vue';
import type { Store } from 'vuex';
import type { State } from '@/store';
import { createStore, useStore as baseUseStore } from 'vuex';
import { StorageOptions } from './storage/reset';
import { reading } from './modules/reading';

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>(
	StorageOptions({
		modules: {
			reading,
			test: {
				_storage: true,
				namespaced: true,
				state: {
					a: 1,
				},
				mutations: {
					tst() {},
				},
				modules: {
					reading,
				},
			},
		},
	}),
);

/** useStore组合式函数 */
export function useStore() {
	return baseUseStore(key);
}
