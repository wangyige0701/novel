import { checkFrequency, isString, type Fn } from '@wang-yige/utils';
import type { RequestConfig } from '@/@types/common/request';

export type Config = RequestConfig & { method: UniApp.RequestOptions['method'] };

export class RequestCache {
	private static cacheMap = new Map<string, Promise<UniApp.RequestSuccessCallbackResult>>();

	static has(src: string) {
		return this.cacheMap.has(src);
	}

	static get(src: string) {
		return this.cacheMap.get(src);
	}

	static set(src: string, value: Promise<UniApp.RequestSuccessCallbackResult>, time: number) {
		if (time > 0) {
			this.cacheMap.set(src, value);
			setTimeout(() => {
				this.cacheMap.delete(src);
			}, time);
		}
	}
}

export class RequestSync {
	private static syncMap = new Map<string, Promise<UniApp.RequestSuccessCallbackResult>>();

	static has(src: string) {
		return this.syncMap.has(src);
	}

	static get(src: string) {
		return this.syncMap.get(src);
	}

	static set(src: string, value: Promise<UniApp.RequestSuccessCallbackResult>) {
		this.syncMap.set(src, value);
		value.finally(() => {
			this.syncMap.delete(src);
		});
	}
}

export class RequestFrequent {
	private static frequentMap = new Map<string, Fn<[], boolean>>();

	static use(src: string, range: number, maximum: number) {
		if (!this.frequentMap.has(src)) {
			const use = checkFrequency({ range, maximum });
			this.frequentMap.set(src, use);
		}
		const use = this.frequentMap.get(src)!;
		return use();
	}
}

export function params(options: string | RequestConfig, method: UniApp.RequestOptions['method'] = 'GET'): Config {
	if (isString(options)) {
		return { url: options, method };
	}
	return { ...options, method };
}
