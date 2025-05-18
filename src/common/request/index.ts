import { isBoolean, isNumber, isString, isUndef } from '@wang-yige/utils';
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

		if (isNumber(options.cache) || isUndef(options.cache)) {
			this.cacheTime = options.cache ?? 5000;
		} else if (isBoolean(options.cache)) {
			this.cacheTime = options.cache ? -1 : 0;
		} else {
			throw new Error('cache 参数类型错误，需要为数字类型或布尔类型');
		}
		if (this.cacheTime === 0) {
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
			return RequestSync.get(url)!;
		}
		const isGet = this.isCache && this.method === 'GET';
		if (isGet && RequestCache.has(url)) {
			return RequestCache.get(url)!;
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
}

/**
 * 发送具体类型请求，会对返回结果进行解析
 */
export class Request extends UseRequest {
	private static _parse(res: UniApp.RequestSuccessCallbackResult) {
		if (res.statusCode >= 400 && res.statusCode < 600) {
			// 400 和 500 的状态码会抛出错误
			return Promise.reject(res.data);
		}
		return Promise.resolve(res.data);
	}

	/**
	 * `GET` 请求，默认设置 `cache` 为 `true`
	 */
	static async get(options: string | RequestConfig) {
		return this._parse(await this.request(isString(options) ? options : { cache: true, ...options }, 'GET'));
	}

	static async post(options: string | RequestConfig) {
		return this._parse(await this.request(options, 'POST'));
	}
}
