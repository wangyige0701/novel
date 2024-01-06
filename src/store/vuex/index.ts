import type { InjectionKey } from 'vue';
import type { Store } from 'vuex';
import type { State, ModulesState } from '@/store';
import { createStore, useStore as baseUseStore } from 'vuex';
import { StorageOptions, $storage } from './storage';
import { reading } from './modules/reading';

export const key: InjectionKey<Store<ModulesState>> = Symbol();

export const store = createStore<State>(
	StorageOptions(
		{
			state: {
				a: 1,
			},
			modules: {
				reading,
			},
		},
		$storage,
	),
);

/** useStore组合式函数 */
export function useStore() {
	return baseUseStore(key);
}
