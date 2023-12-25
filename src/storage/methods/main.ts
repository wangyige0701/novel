/** 前缀校验正则 */
export const prefixCheckRegexp = /(?:uni\-|uni\_|dcloud\-|dcloud\_).*/;

/**
 * 校验前缀
 * @param key
 * @returns
 */
export function prefixCheck(key: string) {
	return prefixCheckRegexp.test(key);
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
