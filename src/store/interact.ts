import type {
	InteractBindType,
	InteractBindTypeUse,
	InteractTipOptions,
	InteractStoreListItem,
	InteractStoreUses,
	InteractStoreOptions,
	InteractModalOptions,
	InteractPopupOptions,
} from '@/@types/store/interact';
import { StoreKey } from '@/config/store';
import { createPromise, Fn, isNumber, type PromiseReject, type PromiseResolve } from '@wang-yige/utils';
import { defineStore } from 'pinia';

function bindType<T extends InteractBindTypeUse>(fn: T) {
	const result = Object.create(null) as InteractBindType<T>;
	(['success', 'warning', 'error', 'info'] as const).forEach(type => {
		result[type] = (options: Parameters<T>[1]) => fn(type, options);
	});
	return result;
}

export const useInteractStore = defineStore(StoreKey.interact, () => {
	const list = shallowReactive<InteractStoreListItem[]>([]);
	const value = computed(() => [...list]); // 追踪依赖

	function add<T extends InteractStoreUses>(use: T, options: InteractStoreOptions<T>) {
		const { resolve, reject, promise } = createPromise<void, Promise<void> & { index: number; close: Fn }>();
		const data = {
			use,
			options,
			resolve,
			reject,
		};
		const index = list.push(data);
		const _close = () => {
			return close(list.indexOf(data));
		};
		promise.index = index - 1;
		promise.close = _close;
		return promise;
	}
	function close(index?: number) {
		if (!isNumber(index) || index < 0) {
			index = list.length - 1;
		}
		list.splice(index, 1);
		return index;
	}
	function back() {
		if (list.length <= 0) {
			return -1;
		}
		return close();
	}
	function clear() {
		list.splice(0, list.length);
	}

	return {
		back,
		close,
		clear,
		value,
		tip: { ...bindType((type, options: InteractTipOptions) => add('tip', { ...options, type })) },
		modal: (options: InteractModalOptions) => add('modal', { ...options }),
		popup: (options: InteractPopupOptions) => add('popup', { ...options }),
	};
});
