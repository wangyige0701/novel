import log from '@/log';

/** 前缀校验正则 */
export const prefixCheckRegexp = /(?:uni\-|uni\_|dcloud\-|dcloud\_).*/;

/**
 * 校验前缀
 * @param key
 * @returns
 */
export function prefixCheck(key: string) {
	const result = prefixCheckRegexp.test(key);
	if (process.env.NODE_ENV !== 'production') {
		if (result) {
			log.warn(`${key} 存在系统缓存前缀，可能会导致冲突，请检查！`);
		}
	}
	return result;
}

/**
 * 创建一个promise，并且返回resolve和reject
 * @returns
 */
export function createProm<T extends any = void>(): [Promise<T>, ResolveFunc<T>, RejectFunc] {
	let _resolve: ResolveFunc<T>, _reject: RejectFunc;
	const prom = new Promise<T>((resolve, reject) => {
		_resolve = resolve;
		_reject = reject;
	});
	// @ts-ignore
	return [prom, _resolve, _reject];
}
