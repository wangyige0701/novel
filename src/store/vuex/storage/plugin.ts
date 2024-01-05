import type { Store } from 'vuex';
import type { State } from '@/store';
import type { RefreshStateDatas, SettingStorageCallback, PathMapValue } from '../@types';
import { __STORAGE__ } from './datas';

/** 监听并更新缓存数据插件 */
export const storage = function (
	paths: Map<string, PathMapValue>,
	clear: Function,
	settingStorage: SettingStorageCallback,
	delayTime: number = 300,
) {
	return (store: Store<State>) => {
		if (!('_modules' in store)) {
			throw new Error(`plugin ${storage.name} need in root store`);
		}
		paths.forEach(({ filter, getterPath }, path) => {
			let timeout: NodeJS.Timeout;
			store.watch(
				// @ts-ignore
				(_, getters) => getters[getterPath],
				(newValue, oldValue) => {
					if (timeout) {
						clearTimeout(timeout);
					}
					timeout = setTimeout(() => {
						const refresh = compareValues(newValue, oldValue).filter(item => filter.includes(item.key));
						settingStorage(path, refresh);
					}, delayTime);
				},
				{
					immediate: true,
				},
			);
		});
		clear();
	};
};

/** 比较新旧值 */
function compareValues(newValue: any, oldValue: any) {
	const result: RefreshStateDatas[] = [];
	if (newValue === oldValue || !newValue) {
		return result;
	}
	for (const key in newValue) {
		if (!oldValue || !oldValue.hasOwnProperty(key) || newValue[key] !== oldValue[key]) {
			result.push({
				key,
				data: newValue[key],
			});
		}
	}
	return result;
}
