import { AsyncQueue } from '@/utils/asyncQueue';
import { isArray, isFunction } from '@/utils/types';
import { createProm, prefixCheck } from './main';

type SetterDataType = {
	key: string;
	data: any;
};

/**
 * 设置本地缓存数据
 * @param storeDatas 传入包含`key`和`data`两个属性的对象或这个对象的数组；key前缀不能为系统缓存前缀，如果是，会跳过；
 * @param callback 传入`promise`时，会返回一个promise实例；传入一个回调函数不接受任何参数
 */
export function setStorage(storeDatas: SetterDataType | SetterDataType[]): void;
export function setStorage(storeDatas: SetterDataType | SetterDataType[], callback: () => void): void;
export function setStorage(storeDatas: SetterDataType | SetterDataType[], callback: 'promise'): Promise<void>;
export function setStorage(storeDatas: SetterDataType | SetterDataType[], callback?: 'promise' | (() => void)) {
	if (!isArray(storeDatas)) {
		storeDatas = [storeDatas];
	}
	if (!callback) {
		try {
			storeDatas.map(storeData => {
				if (prefixCheck(storeData.key)) {
					return;
				}
				return uni.setStorageSync(storeData.key, storeData.data);
			});
		} catch (error) {
			throw new Error(error);
		}
		return;
	}
	function _set(key: string, data: any): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				uni.setStorage({
					key,
					data,
					success(data) {
						if (data.errMsg && data.errMsg.indexOf('ok') > -1) {
							resolve();
						} else {
							reject(data);
						}
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
		for (const storeData of storeDatas) {
			// 前缀如果是系统缓存前缀则跳过
			if (prefixCheck(storeData.key)) {
				continue;
			}
			asyncQueue.add(_set.bind(null, storeData.key, storeData.data)).catch(reject);
		}
		return prom;
	}
	if (!isFunction(callback)) {
		throw new TypeError('`callback` must be function or string of `promise` when entry');
	}
	asyncQueue.empty(() => {
		callback();
	});
	for (const storeData of storeDatas) {
		if (prefixCheck(storeData.key)) {
			continue;
		}
		asyncQueue.add(_set.bind(null, storeData.key, storeData.data)).catch(err => {
			throw new Error(err);
		});
	}
}
