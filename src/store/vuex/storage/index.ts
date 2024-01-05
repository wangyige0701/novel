import type { SettingStorageCallback } from '../@types';
import { setVuexInStorage } from './toStorage';

export { StorageOptions } from './reset';

/** 自动设置缓存的回调函数 */
export const $storage: SettingStorageCallback = (path, datas) => {
	setVuexInStorage(path, datas);
};
