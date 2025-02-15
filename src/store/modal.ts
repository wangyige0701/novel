import { defineStore } from 'pinia';
import { createPromise, type Fn, isNumber } from '@wang-yige/utils';
import type { LoadingModalOptions, ModalStoreData, ModalUsage } from '@/@types/store/modal';
import { StoreKey } from '@/config/store';

/**
 * 挂载弹层类型属性到对象上
 */
function mountProps<T extends Fn<[options: Omit<ModalStoreData, 'use'>], any>>(fn: T): ModalUsage<T> {
	const result = Object.create(null) as ModalUsage<T>;
	(['success', 'warning', 'error', 'info'] as const).forEach(item => {
		result[item] = (title, message, opts) => {
			return fn({ ...opts, title, message, type: item });
		};
	});
	return result as ModalUsage<T>;
}

/**
 * 管理弹层
 */
export const useModalStore = defineStore(StoreKey.modal, () => {
	const baseZIndex = 99999;
	const modalList = shallowReactive<ModalStoreData[]>([]);
	const value = computed(() => [...modalList]);
	function add(options?: ModalStoreData) {
		const { use = 'alert', type = 'info' } = options || {};
		const item = { ...options, use, type };
		const length = modalList.push(item);
		const { resolve, reject } = createPromise();
		function _close(type: 'ok' | 'cancel') {
			modalList.splice(modalList.indexOf(item), 1);
			if (type === 'ok') {
				resolve(item);
			} else {
				reject('cancel');
			}
		}
		return {
			index: length - 1,
			ok: () => _close('ok'),
			cancel: () => _close('cancel'),
		};
	}
	function close(index?: number) {
		if (!isNumber(index)) {
			index = modalList.length - 1;
		}
		modalList.splice(index, 1);
		return index;
	}
	function back() {
		if (modalList.length <= 0) {
			return -1;
		}
		return close();
	}
	function clear() {
		modalList.splice(0, modalList.length);
	}
	return {
		back,
		close,
		clear,
		value,
		baseZIndex,
		alert: {
			...mountProps(options => add({ ...options, use: 'alert' })),
		},
		confirm: {
			...mountProps(options => add({ ...options, use: 'confirm' })),
		},
		loading: (options?: LoadingModalOptions) => add({ use: 'loading', ...options }),
	};
});
