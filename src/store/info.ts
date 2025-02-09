import { defineStore } from 'pinia';
import { StoreKey } from '@/config/store';

/**
 * 设备及基础信息
 */
export const useInfoStore = defineStore(StoreKey.info, () => {
	const data = Object.create(null) as InfoStoreData;
	data.statusBarHeight = 0;
	function set<T extends keyof InfoStoreData>(key: T, value: InfoStoreData[T]) {
		data[key] = value;
	}
	function get<T extends keyof InfoStoreData>(key: T) {
		return data[key] as InfoStoreData[T];
	}
	return {
		set,
		get,
	};
});
