import { isArray, isFunction, isUndefined } from '@/utils/types';
import { createProm, prefixCheckRegexp } from './main';
import { AsyncQueue } from '@/utils/asyncQueue';

/**
 * 排除系统前缀缓存
 * @param datas
 * @returns
 */
function filterSystemPrefix(datas: string[]) {
	return datas.filter(data => !prefixCheckRegexp.test(data));
}

/**
 * 获取缓存数据
 * @param keys 传入`all`时，返回所有本地缓存数据键值；传入`exclude`时，`keys`属性中会排除系统缓存；获取单个缓存数据需要传入对应键值；使用此方法不能将键值设为`all`或`exclude`
 * @param callback 传入`promise`时，返回一个promise实例；传入一个回调函数，可以接受缓存数据作为参数
 */
export function getStorage(keys: string): any;
export function getStorage(keys: string[]): any[];
export function getStorage(keys: string, callback: 'promise'): Promise<any>;
export function getStorage(keys: string[], callback: 'promise'): Promise<any[]>;
export function getStorage(keys: string, callback: (data: any, err?: any) => void): void;
export function getStorage(keys: string[], callback: (data: any[], err?: any) => void): void;
export function getStorage(keys: 'all' | 'exclude'): UniApp.GetStorageInfoSuccess;
export function getStorage(keys: 'all' | 'exclude', callabck: undefined): UniApp.GetStorageInfoSuccess;
export function getStorage(keys: 'all' | 'exclude', callback: 'promise'): Promise<UniApp.GetStorageInfoSuccess>;
export function getStorage(
	keys: 'all' | 'exclude',
	callback: (data: UniApp.GetStorageInfoSuccess, err?: any) => void,
): void;
export function getStorage(
	keys: string | string[] | 'all' | 'exclude',
	callback?: 'promise' | ((data: UniApp.GetStorageInfoSuccess | any[] | any, err?: any) => void),
) {
	const toAll = keys === 'all';
	const toExclude = keys === 'exclude';
	const getAll = toAll || toExclude;
	let useKeys: string[] = [],
		returnType: 'string' | 'array' = 'array';
	if (!isArray(keys) && !toAll && !toExclude) {
		useKeys = [keys];
		returnType = 'string';
	} else if (!toAll && !toExclude) {
		useKeys = keys;
	}
	useKeys = filterSystemPrefix(useKeys);
	if (!callback) {
		// 同步调用
		try {
			if (getAll) {
				// 获取全部数据
				const result = uni.getStorageInfoSync();
				if (toExclude) {
					// 排除系统缓存
					result.keys = filterSystemPrefix(result.keys);
					return result;
				}
				return result;
			}
			const result = useKeys.map(key => uni.getStorageSync(key));
			return returnType === 'array' ? result : result[0];
		} catch (error) {
			throw new Error(error);
		}
	}
	function _get(): Promise<UniApp.GetStorageInfoSuccess>;
	function _get(key: string): Promise<any>;
	function _get(key?: string) {
		return new Promise((resolve, reject) => {
			const keyIsUndefined = isUndefined(key);
			const useFunc = keyIsUndefined ? uni.getStorageInfo : uni.getStorage;
			// @ts-ignore
			const options = keyIsUndefined ? {} : { key };
			try {
				useFunc({
					...options,
					success(data) {
						if (toExclude) {
							data.keys = filterSystemPrefix(data.keys);
						}
						// @ts-ignore
						if (keyIsUndefined) {
							return resolve(data);
						}
						// @ts-ignore
						if (data.errMsg && data.errMsg.indexOf('ok') > -1) {
							// @ts-ignore
							return resolve(data.data);
						}
						resolve('');
					},
					fail(result: any) {
						reject(result);
					},
				});
			} catch (error) {
				reject(error);
			}
		});
	}
	if (getAll) {
		if (callback === 'promise') {
			// 通过promise异步获取全部缓存
			return _get();
		}
		if (!isFunction(callback)) {
			throw new TypeError('`callback` must be function or string of `promise` when entry');
		}
		// 通过回调函数异步获取全部缓存
		_get()
			.then(data => {
				callback(data);
			})
			.catch(err => {
				throw new Error(err);
			});
		return;
	}
	const asyncQueue = new AsyncQueue<any>(1);
	const result: any[] = [];
	if (callback === 'promise') {
		// 通过promise异步获取指定键值缓存
		const [prom, resolve, reject] = createProm<any[]>();
		asyncQueue.empty(() => {
			resolve(returnType === 'array' ? result : result[0]);
		});
		for (const key of useKeys) {
			asyncQueue
				.add(_get.bind(null, key))
				.then(data => {
					result.push(data);
				})
				.catch(err => {
					result.push('');
					reject(err);
				});
		}
		return prom;
	}
	if (!isFunction(callback)) {
		throw new TypeError('`callback` must be function or string of `promise` when entry');
	}
	// 通过回调函数异步执行获取指定键值缓存
	asyncQueue.empty(() => {
		callback(returnType === 'array' ? result : result[0]);
	});
	for (const key of useKeys) {
		asyncQueue
			.add(_get.bind(null, key))
			.then(data => {
				result.push(data);
			})
			.catch(err => {
				result.push('');
				callback(void 0, err);
			});
	}
}
