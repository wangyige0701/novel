import type { Component } from 'vue';
import type {
	InteractBindType,
	InteractBindTypeUse,
	InteractTipOptions,
	InteractStoreListItem,
	InteractStoreUses,
	InteractStoreOptions,
	InteractModalOptions,
	InteractPopupOptions,
	InteractLoadingOptions,
} from '@/@types/store/interact';
import type { InteractMask } from '@/@types/components/interact';
import { defineStore } from 'pinia';
import { StoreKey } from '@/config/store';
import { createPromise, isNumber } from '@wang-yige/utils';

/**
 * 绑定提示类型
 */
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

	function add<T extends InteractStoreUses>(use: T, options: InteractStoreOptions<T> & InteractMask) {
		const { resolve, reject, promise } = createPromise<void, Promise<void>>();
		const data = { use, options, resolve, reject, visible: ref(true) };
		list.push(data);
		const _close = () => {
			return close(list.indexOf(data));
		};
		return {
			close: _close,
			then: (onfulfilled?: ((value: void) => void | PromiseLike<void>) | null | undefined) => {
				return promise.then(onfulfilled);
			},
			catch: (onrejected?: ((reason: any) => PromiseLike<never>) | null | undefined) => {
				return promise.catch(onrejected);
			},
			finally: (onfinally?: (() => void) | null | undefined) => {
				return promise.finally(onfinally);
			},
		};
	}
	function close(index?: number) {
		if (!isNumber(index) || index < 0) {
			index = list.length - 1;
		}
		list.splice(index, 1).forEach(item => {
			item.visible.value = false;
		});
		return index;
	}
	function back() {
		if (list.length <= 0) {
			return -1;
		}
		return close();
	}
	function clear() {
		list.splice(0, list.length).forEach(item => {
			item.visible.value = false;
		});
	}

	return {
		/** 关闭上一个交互弹层 */
		back,
		/** 关闭指定交互弹层 */
		close,
		/** 关闭所有弹层 */
		clear,
		value,
		tip: {
			...bindType((type, options: InteractTipOptions) => add('tip', { ...options, type, mask: false })),
		},
		modal: <T extends Component>(options?: InteractModalOptions<T>) => add('modal', { ...options, mask: true }),
		popup: <T extends Component>(options?: InteractPopupOptions<T>) => add('popup', { ...options, mask: true }),
		loading: (options?: InteractLoadingOptions) => add('loading', { ...options, mask: true, maskClosable: false }),
	};
});
