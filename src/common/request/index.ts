import { isNumber } from '@wang-yige/utils';
import type { RequestConfig } from '@/@types/common/request';
import { params, RequestCache, RequestFrequent, RequestSync, type Config } from './utils';

export class UseRequest {
	private url: string;
	private method: UniApp.RequestOptions['method'];
	private options: RequestConfig;
	private limitCount: number;
	private isLimitFrequent: boolean = false;
	private isCache: boolean = true;
	private cacheTime: number;
	private isSync: boolean = false;

	/**
	 * @param options 请求配置，可以是url字符串，也可以是对象
	 */
	constructor(options: Config) {
		this.options = options;
		this.url = options.url;
		this.method = options.method;

		this.cacheTime = options.cache ?? -1;
		if (!isNumber(this.cacheTime)) {
			this.cacheTime = -1;
		}
		if (this.cacheTime <= 0) {
			this.isCache = false;
		}
		this.limitCount = options.frequent ?? -1;
		if (!isNumber(this.limitCount)) {
			this.limitCount = -1;
		}
		if (this.limitCount > 0) {
			this.isLimitFrequent = true;
		}
		if (options.sync) {
			this.isSync = true;
		}
	}

	request() {
		const url = this.url;
		if (this.isLimitFrequent && RequestFrequent.use(url, 1000, this.limitCount)) {
			throw new Error(`请求过于频繁，请稍后再试`);
		}
		if (this.isSync && RequestSync.has(url)) {
			return RequestSync.get(url);
		}
		const isGet = this.isCache && this.method === 'GET';
		if (isGet && RequestCache.has(url)) {
			return RequestCache.get(url);
		}
		const res = uni.request({ ...this.options, method: this.method });
		if (isGet) {
			RequestCache.set(url, res, this.cacheTime);
		}
		if (this.isSync) {
			RequestSync.set(url, res);
		}
		return res;
	}

	static request(options: string | RequestConfig, method: NonNullable<UniApp.RequestOptions['method']>) {
		const useRequest = new UseRequest(params(options, method));
		return useRequest.request();
	}

	static get(options: string | RequestConfig) {
		return this.request(options, 'GET');
	}

	static post(options: string | RequestConfig) {
		return this.request(options, 'POST');
	}
}
