import { defineStore } from 'pinia';
import { createPromise, type Fn, isNumber } from '@wang-yige/utils';
import type { ModalStoreData, ModalUsage } from '@/@types/store/modal';
import { StoreKey } from '@/config/store';

function mountProps<T extends Fn<[options?: ModalStoreData], any>>(fn: T): ModalUsage<T> {
	const result = (...args: Parameters<T>) => {
		return fn(...args);
	};
	(['success', 'warning', 'error', 'info'] as const).forEach(item => {
		(result as ModalUsage<T>)[item] = (title, message, mask) => {
			return fn({ title, message, mask, type: item });
		};
	});
	return result as ModalUsage<T>;
}

export const useModalStore = defineStore(StoreKey.modal, () => {
	const baseZIndex = 99999;
	const modalList = shallowReactive<ModalStoreData[]>([]);
	function add(options?: ModalStoreData) {
		const { use = 'alert', type = 'info', mask = true } = options || {};
		const item = { ...options, use, type, mask };
		modalList.push(item);
		const { resolve, reject } = createPromise();
		function close(type: 'ok' | 'cancel') {
			modalList.splice(modalList.indexOf(item), 1);
			if (type === 'ok') {
				resolve(item);
			} else {
				reject('cancel');
			}
		}
		return {
			ok: () => close('ok'),
			cancel: () => close('cancel'),
		};
	}
	function remove(index?: number) {
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
		return remove();
	}
	return {
		back,
		baseZIndex,
		value: modalList,
		alert: {
			...mountProps(options => add({ use: 'alert', ...options })),
		},
		confirm: {
			...mountProps(options => add({ use: 'confirm', ...options })),
		},
	};
});
