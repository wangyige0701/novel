import { onBackPress } from '@dcloudio/uni-app';
import { useInteractStore } from '@/store/interact';

/**
 * onBackPress 中关闭交互层的回调函数
 */
export function backInteract() {
	onBackPress(() => {
		const useinteract = useInteractStore();
		if (useinteract.back() >= 0) {
			return true;
		}
	});
}
