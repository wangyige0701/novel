import { clearStorage } from './methods/clear';
import { getStorage } from './methods/getter';
import { removeStorage } from './methods/remove';
import { setStorage } from './methods/setter';

/** 缓存处理 */
export const storage = {
	set: setStorage,
	get: getStorage,
	remvoe: removeStorage,
	clear: clearStorage,
};
