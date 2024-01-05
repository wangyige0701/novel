import type { StoreOptions } from 'vuex';
import type { State } from '@/store';
import type { ResetStoreOptions, ResetModule, SettingStorageCallback, PathMapValue } from '../@types';
import { isArray, isObject } from '@common/utils/types';
import { hasProperty } from '@common/utils/simples';
import { deepClone } from '@common/utils/clone';
import { __STORAGE__, __ROOT_NAME__ } from './datas';
import { storage } from './plugin';
import { getVuexStorageData, removeVuexFromStorage } from './toStorage';

type UseTarget = ResetModule<any, any> | ResetStoreOptions<any>;

/** 路径和缓存键值映射 */
let pathMap: Map<string, PathMapValue> = new Map();

/** 缓存赋值 */
function cacheValue(target: UseTarget, path: string) {
	const cache = getVuexStorageData();
	const { filter } = pathMap.get(path) ?? {};
	if (path && filter && isObject(cache)) {
		const cacheDatas = cache[path];
		if (isObject(cacheDatas)) {
			for (const keyVal in cacheDatas) {
				if (!filter.includes(keyVal)) {
					// 移除不再需要的state中的属性
					removeVuexFromStorage(path, keyVal);
					continue;
				}
				if (keyVal in target.state) {
					target.state[keyVal] = cacheDatas[keyVal];
				}
			}
		}
	}
}

/** 更新map映射 */
function updateMap(target: UseTarget, path: string, filter: string[]) {
	if (!hasProperty(target, 'state')) {
		return;
	}
	filter = filter.filter(item => item in target.state);
	if (filter.length === 0) {
		return;
	}
	if (!hasProperty(target, 'getters')) {
		target.getters = {};
	}
	const getters = target.getters;
	// @ts-ignore
	getters[__STORAGE__] = (state: State) => {
		return filter.reduce((prev, curr) => {
			// @ts-ignore
			prev[curr] = state[curr];
			return prev;
		}, {});
	};
	pathMap.set(path, {
		filter,
		getterPath: path.slice(__ROOT_NAME__.length) + __STORAGE__,
	});
	cacheValue(target, path);
}

/** 重置配置项处理 */
function resetOptions(options: UseTarget, path: string) {
	if (!options) {
		return;
	}
	if (hasProperty(options, '_storage')) {
		const _storage = options._storage;
		if (_storage === true) {
			// 所有属性
			updateMap(options, path, Object.keys(options.state ?? {}));
		} else if (isArray(_storage)) {
			// 指定属性
			updateMap(options, path, _storage);
		}
		delete options._storage;
		if (path !== __ROOT_NAME__) {
			// 根元素下不需要设置namespaced
			if (!hasProperty(options, 'namespaced') || (options as ResetModule<any, any>).namespaced !== true) {
				// 设置了_storage属性namespaced自动置为true
				(options as ResetModule<any, any>).namespaced = true;
			}
		}
	}
	if (hasProperty(options, 'modules')) {
		const modules = options.modules;
		for (const key in modules) {
			const module = modules[key];
			if (isObject(module)) {
				resetOptions(module, path + key + '/');
			}
		}
	}
}

/** 重置`createStore`配置项，允许添加`_storage`属性 */
export function StorageOptions(
	options: ResetStoreOptions<State>,
	settingStorage?: SettingStorageCallback,
	delayTime?: number,
): StoreOptions<State> {
	if (!options) {
		return {};
	}
	options = deepClone(options);
	resetOptions(options, __ROOT_NAME__);
	// 判断是否需要移除模块级别的缓存数据
	const nowCacheDatas = getVuexStorageData();
	const cacheModules = Object.keys(nowCacheDatas);
	for (const moduleKey of cacheModules) {
		if (!pathMap.has(moduleKey)) {
			removeVuexFromStorage(moduleKey, true);
		}
	}
	if (!settingStorage) {
		return options;
	}
	if (!hasProperty(options, 'plugins')) {
		options.plugins = [];
	}
	options.plugins!.unshift(
		storage(
			pathMap,
			() => {
				pathMap.clear();
				(pathMap as unknown) = null;
			},
			settingStorage,
			delayTime,
		),
	);
	return options;
}
