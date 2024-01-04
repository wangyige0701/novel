import type { StoreOptions } from 'vuex';
import type { State } from '@/store';
import type { ResetStoreOptions, ResetModule } from '../@types/resetOptions';
import { isArray, isObject } from '@/utils/types';
import { hasProperty } from '@/utils/simples';
import { deepClone } from '@/utils/clone';
import { __STORAGE__ } from './datas';
import { storage } from './plugin';
import { getVuexStorageData } from './toStorage';

type UseTarget = ResetModule<any, any> | ResetStoreOptions<any>;

/** 路径和缓存键值映射 */
const pathMap: Map<string, string[]> = new Map();

/** 缓存赋值 */
function cacheValue(target: UseTarget, path: string) {
	const cache = getVuexStorageData();
	const filter = pathMap.get(path);
	if (filter && isObject(cache)) {
		const cacheDatas = cache[path];
		if (isObject(cacheDatas)) {
			for (const keyVal in cacheDatas) {
				if (!filter.includes(keyVal)) {
					continue;
				}
				if (keyVal in target.state) {
					target.state[keyVal] = cacheDatas[keyVal];
				}
			}
		}
	}
}

/** 创建`mutations`属性 */
function createMutation(target: UseTarget, path: string, filter: string[]) {
	if (!hasProperty(target, 'state')) {
		return;
	}
	filter = filter.filter(item => item in target.state);
	if (filter.length === 0) {
		return;
	}
	if (!hasProperty(target, 'mutations')) {
		target.mutations = {};
	}
	const mutations = target.mutations;
	// @ts-ignore
	mutations[__STORAGE__] = (state: State, payload: Partial<State>) => {
		console.log(state, payload);
	};
	pathMap.set(path, filter);
	cacheValue(target, path);
}

/** 重置配置项处理 */
function resetOptions(options: UseTarget, path: string = 'root/') {
	if (!options) {
		return;
	}
	if (hasProperty(options, '_storage')) {
		const _storage = options._storage;
		if (_storage === true) {
			// 所有属性
			createMutation(options, path, Object.keys(options.state ?? {}));
		} else if (isArray(_storage)) {
			// 指定属性
			createMutation(options, path, _storage);
		}
		delete options._storage;
	}
	if (hasProperty(options, 'modules')) {
		const modules = options.modules;
		for (const key in modules) {
			const module = modules[key];
			if (isObject(module)) {
				if (path === 'root/') {
					path = '';
				}
				resetOptions(module, path + key + '/');
			}
		}
	}
}

/** 重置`createStore`配置项，允许添加`_storage`属性 */
export function StorageOptions(options: ResetStoreOptions<State>): StoreOptions<State> {
	if (!options) {
		return {};
	}
	options = deepClone(options);
	resetOptions(options);
	if (!hasProperty(options, 'plugins')) {
		options.plugins = [];
	}
	options.plugins!.unshift(storage);
	console.log(options);
	console.log(pathMap);
	return options;
}
