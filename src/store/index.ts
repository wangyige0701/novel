import type { InjectionKey } from 'vue';
import type { Store } from 'vuex';
import type { State } from '@/store';
import { createStore, useStore as baseUseStore } from 'vuex';

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
	state: {},
});

/** useStore组合式函数 */
export function useStore() {
	return baseUseStore(key);
}
