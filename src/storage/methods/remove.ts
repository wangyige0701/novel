import { AsyncQueue } from '@/utils/asyncQueue';
import { isArray, isFunction } from '@/utils/types';
import { createProm, prefixCheck } from './main';

/**
 * 移除本地缓存数据
 * @param keys 需要清除的缓存数据键名，可以传字符串或者字符串数组
 * @param callabck 传入`promise`时，会返回一个promise实例；传入一个回调函数不接受任何参数
 */
export function removeStorage(keys: string | string[]): void;
export function removeStorage(keys: string | string[], callback: () => void): void;
export function removeStorage(keys: string | string[], callabck: 'promise'): Promise<void>;
export function removeStorage(keys: string | string[], callback?: 'promise' | (() => void)) {
	if (!isArray(keys)) {
		keys = [keys];
	}
	if (!callback) {
		try {
			keys.map(key => {
				if (prefixCheck(key)) {
					return;
				}
				return uni.removeStorageSync(key);
			});
		} catch (error) {
			throw new Error(error);
		}
		return;
	}
	function _remove(key: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				uni.removeStorage({
					key,
					success(data) {
						if (data.errMsg && data.errMsg.indexOf('ok') > -1) {
							resolve();
						}
						reject(data);
					},
					fail(result) {
						reject(result);
					},
				});
			} catch (error) {
				reject(error);
			}
		});
	}
	const asyncQueue = new AsyncQueue<void>(1);
	if (callback === 'promise') {
		const [prom, resolve, reject] = createProm();
		asyncQueue.empty(() => {
			resolve();
		});
		for (const key of keys) {
			if (prefixCheck(key)) {
				continue;
			}
			asyncQueue.add(_remove.bind(null, key)).catch(reject);
		}
		return prom;
	}
	if (!isFunction(callback)) {
		throw new TypeError('`callback` must be function or string of `promise` when entry');
	}
	asyncQueue.empty(() => {
		callback();
	});
	for (const key of keys) {
		if (prefixCheck(key)) {
			continue;
		}
		asyncQueue.add(_remove.bind(null, key));
	}
}
