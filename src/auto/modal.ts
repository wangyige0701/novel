import { useModalStore } from '@/store/modal';

/**
 * onBackPress 中关闭 modal 层的回调函数
 */
export function backModal(_options: Page.BackPressOption) {
	const modalStore = useModalStore();
	if (modalStore.back() >= 0) {
		return true;
	}
}
