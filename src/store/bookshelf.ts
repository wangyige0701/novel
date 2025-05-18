import { computed } from 'vue';
import { defineStore } from 'pinia';
import { StoreKey } from '@/config/store';
import { useSearchProxyStore } from './proxy';
import { SourceIds } from '@/config/proxy';
import { BiquBookshelf } from '@/interface/biqu';

const bookshelfs = {
	[SourceIds.biqu]: BiquBookshelf,
};

/**
 * 获取当前的书架对象
 */
export const useBookshelf = defineStore(StoreKey.bookshelf, () => {
	const sourceId = useSearchProxyStore().sourceId;
	if (!bookshelfs[sourceId]) {
		throw new Error(`源 id：${sourceId} 不存在`);
	}
	const current = computed(() => {
		return bookshelfs[useSearchProxyStore().sourceId];
	});
	return {
		current,
	};
});
