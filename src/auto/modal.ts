import { useModalStore } from '@/store/modal';

export function backModal(_options: Page.BackPressOption) {
	const modalStore = useModalStore();
	if (modalStore.back() >= 0) {
		return true;
	}
}
