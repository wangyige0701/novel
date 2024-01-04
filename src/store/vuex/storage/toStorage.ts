import type { Store } from 'vuex';
import type { State } from '@/store';
import { storage } from '@/storage';
import { isObject } from '@/utils/types';
import { __STORAGE_KEY__ } from './datas';

type StoreDatas = Store<State>;

type VuexStorage = {
	[key in keyof StoreDatas]: StoreDatas[key];
};

let storageCache: object;
let timeout: NodeJS.Timeout;

export function getVuexStorageData() {
	if (storageCache) {
		if (timeout) {
			clearTimeout(timeout);
		}
		return storageCache;
	}
	storageCache = storage.get(__STORAGE_KEY__);
	timeout = setTimeout(() => {
		(storageCache as unknown) = void 0;
	}, 3000);
	return storageCache;
}

function getTarget(data: object, modulePath?: string) {
	let origin: { [key: string]: any };
	if (!data || !isObject(data)) {
		origin = {};
	} else {
		origin = data;
	}
	const _key = modulePath ?? 'void/';
	if (!(_key in origin) || !isObject(origin[_key])) {
		origin[_key] = {};
	}
	const target = origin[_key];
	return {
		origin,
		target,
	};
}

export function setVuexInStorage<K extends keyof StoreDatas['state']>(
	key: K,
	value: StoreDatas['state'][K],
	modulePath?: string,
) {
	const { origin, target } = getTarget(getVuexStorageData(), modulePath);
	target[key] = value;
	return storage.set({ key: __STORAGE_KEY__, data: origin });
}

export function getVuexFromStorage(key: keyof StoreDatas, modulePath?: string) {
	const { target } = getTarget(getVuexStorageData(), modulePath);
	return target[key];
}

/**
 * vuex数据初始化，从缓存中获取数据
 * @param store
 */
export function initVuexFromStorage(store: StoreDatas) {
	const datas = storage.get(__STORAGE_KEY__) as VuexStorage;
	store.commit('__init__', datas);
}
