import { defineStore } from 'pinia';
import type { SearchProxy, SearchProxyData } from '@/@types/api/proxy';
import { StoreKey } from '@/config/store';
import { searchProxy, SearchProxyKeys } from '@/config/proxy';

/**
 * 数据获取网络代理配置
 */
export const useSearchProxyStore = defineStore(StoreKey.searchProxy, () => {
	const current = ref<keyof SearchProxy>(SearchProxyKeys.biqu);
	const path = computed(() => {
		const config = getConfig();
		if (process.env.UNI_PLATFORM === 'h5') {
			// h5环境，使用别名访问，防止跨域
			return `/${config.alias || ''}`;
		}
		return config.domain || '/';
	});
	function getConfig() {
		return (searchProxy[current.value] || {}) as SearchProxyData;
	}
	function switchProxy(key: keyof SearchProxy) {
		current.value = key;
	}
	return {
		/** 请求路径 */
		path,
		switch: switchProxy,
	};
});
