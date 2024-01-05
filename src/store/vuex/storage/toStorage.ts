import type { RefreshStateDatas } from '../@types';
import { storage } from '@common/storage';
import { isObject, isString } from '@common/utils/types';
import { __STORAGE_KEY__ } from './datas';

let storageCache: object;
let timeout: NodeJS.Timeout;

/** 获取全部vuex缓存的数据 */
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

/** 获取目标对象 */
function getTarget(modulePath: string) {
	if (!modulePath) {
		throw new Error('modulePath is required');
	}
	const data = getVuexStorageData();
	let origin: { [key: string]: any };
	if (!data || !isObject(data)) {
		origin = {};
	} else {
		origin = data;
	}
	const _key = modulePath;
	if (!(_key in origin) || !isObject(origin[_key])) {
		origin[_key] = {};
	}
	const target = origin[_key];
	return {
		origin,
		target,
	};
}

/** 设置vuex缓存 */
export function setVuexInStorage(modulePath: string, datas: RefreshStateDatas[]) {
	const { origin, target } = getTarget(modulePath);
	for (const { key, data } of datas) {
		target[key] = data;
	}
	return storage.set({ key: __STORAGE_KEY__, data: origin });
}

/** 获取vuex缓存 */
export function getVuexFromStorage(modulePath: string, key: string) {
	const { target } = getTarget(modulePath);
	return target[key];
}

/**
 * 移除指定缓存
 * @param modulePath 模块路径
 * @param key 为true表示是否需要删除模块数据， 否则传入字符串表示键值
 * @param isModule
 * @returns
 */
export function removeVuexFromStorage(modulePath: string, key: string | true) {
	const { origin, target } = getTarget(modulePath);
	if (key === true) {
		delete origin[modulePath];
	} else {
		if (!isString(key)) {
			throw new Error('when remove a key value in module, key must be string');
		}
		delete target[key];
	}
	return storage.set({ key: __STORAGE_KEY__, data: origin });
}
