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
import type { InteractMask, InteractResolve } from '@/@types/components/interact';
import { defineStore } from 'pinia';
import { StoreKey } from '@/config/store';
import { createPromise, delay, isNumber, isString } from '@wang-yige/utils';
import { CloseTypes } from '@/config/interact';
import InteractConfig from '@/config/interact';

/**
 * 绑定提示类型
 */
function bindType<T extends InteractBindTypeUse>(fn: T) {
	const result = Object.create(null) as InteractBindType<T>;
	(['success', 'warning', 'error', 'info', 'primary'] as const).forEach(type => {
		result[type] = (options: Parameters<T>[1]) => fn(type, options);
	});
	return result;
}

type Fulfilled<T extends any> = ((value: InteractResolve) => T | PromiseLike<T>) | null | undefined;
type Rejected<T extends any> = ((reason: any) => PromiseLike<T>) | null | undefined;

/**
 * 交互控制
 */
export const useInteractStore = defineStore(StoreKey.interact, () => {
	let index = 0;
	const list = shallowReactive<InteractStoreListItem[]>([]);
	const value = computed(() => [...list]); // 追踪依赖

	function add<T extends InteractStoreUses>(use: T, options: InteractStoreOptions<T> & InteractMask) {
		const { resolve, reject, promise } = createPromise<InteractResolve>();
		const data = { index: index++, use, options, resolve, reject, visible: ref(true), lock: ref(false) };
		list.push(data);
		const _close = () => {
			return close(list.indexOf(data));
		};
		return {
			close: _close,
			then: <T extends any>(onfulfilled?: Fulfilled<T>) => {
				return promise.then(onfulfilled);
			},
			catch: <T extends any>(onrejected?: Rejected<T>) => {
				return promise.catch(onrejected);
			},
			finally: <T extends any>(onfinally?: (() => T) | null | undefined) => {
				return promise.finally(onfinally);
			},
		};
	}
	function close(index?: number) {
		if (!isNumber(index) || index < 0) {
			index = list.length - 1;
		}
		transition(index, 1);
		return index;
	}
	function back() {
		if (list.length <= 0) {
			return -1;
		}
		const last = list[list.length - 1];
		if (last) {
			const { use } = last;
			if (use === 'loading') {
				// 加载状态阻止物理返回
				return list.length - 1;
			}
			if (use === 'tip') {
				// 提示组件不影响物理返回
				return -1;
			}
		}
		return close();
	}
	function clear() {
		transition(0, list.length);
	}
	/** 处理过渡 */
	async function transition(start: number, count: number) {
		// 需要判断是否被锁
		const unlocked: InteractStoreListItem[] = [];
		list.slice(start, start + count).forEach(item => {
			if (item.lock.value) {
				return;
			}
			unlocked.push(item);
			item.visible.value = false;
		});
		await delay(InteractConfig.duration);
		for (const item of unlocked) {
			list.splice(list.indexOf(item), 1).forEach(item => {
				item.resolve({ type: CloseTypes.Close });
			});
		}
	}

	return {
		/** 关闭上一个交互弹层 */
		back,
		/** 关闭指定交互弹层 */
		close,
		/** 关闭所有弹层 */
		clear,
		value,
		modal: <T extends Component>(options?: InteractModalOptions<T>) => add('modal', { ...options, mask: true }),
		popup: <T extends Component>(options?: InteractPopupOptions<T>) => add('popup', { ...options, mask: true }),
		loading: (options?: InteractLoadingOptions) => {
			return add('loading', { ...options, mask: true, maskClosable: false });
		},
		tip: {
			...bindType((type, options: InteractTipOptions | string) => {
				if (isString(options)) {
					options = { message: options };
				}
				return add('tip', { ...options, type, mask: false, maskBgColor: 'transparent', maskClosable: false });
			}),
		},
	};
});
