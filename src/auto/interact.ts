import { useInteractStore } from '@/store/interact';

/**
 * onBackPress 中关闭 modal 层的回调函数
 */
export function backInteract(_options: Page.BackPressOption) {
	const useinteract = useInteractStore();
	if (useinteract.back() >= 0) {
		return true;
	}
}
