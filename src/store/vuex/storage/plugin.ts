import type { Store, StoreOptions } from 'vuex';
import type { State } from '@/store';

export const storage = (store: Store<State>) => {
	if (!('_modules' in store)) {
		throw new Error(`plugin ${storage.name} need in root store`);
	}
	console.log(store);
	store.subscribe(mutation => {
		console.log(mutation);
	});
};
