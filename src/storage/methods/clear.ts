import { getStorage } from './getter';
import { removeStorage } from './remove';

/**
 * 清除本地缓存
 * @param module 不传默认同步清除，传入`asyn`则为异步清除
 */
export function clearStorage(module: 'asyn'): void;
export function clearStorage(module?: 'asyn') {
	const needAsyn = module === 'asyn';
	if (needAsyn) {
		getStorage('exclude', 'promise')
			.then(data => {
				return removeStorage(data, 'promise');
			})
			.catch(err => {
				throw new Error(err);
			});
		return;
	}
	try {
		const datas = getStorage('exclude');
		removeStorage(datas);
	} catch (error) {
		throw new Error(error);
	}
}
