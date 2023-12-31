import { getInterfaceDataDefault } from '@/config';

// #ifdef H5
import ProxyConfig from './proxy';
import { isBoolean } from '@common/utils/types';

const DomainMap = Object.keys(ProxyConfig).reduce(
	(prev, curr) => {
		prev[ProxyConfig[curr as keyof typeof ProxyConfig]] = curr;
		return prev;
	},
	{} as { [key: string]: string },
);
// #endif

/**
 * header头数据
 **/
const HEADER = {
	'content-type': 'application/x-www-form-urlencoded',
};

/**
 * 全局环境
 **/
const GLOBAL_URL = getInterfaceDataDefault('domain');

/** uni的请求方法 */
const _uni_request_funcs = {
	default: uni.request,
	uploadFile: uni.uploadFile,
	downloadFile: uni.downloadFile,
} as const;

type UniRequestKey = keyof typeof _uni_request_funcs;

type UniRequestType<T extends UniRequestKey> = (typeof _uni_request_funcs)[T];

type UniRequestReturn<T extends UniRequestKey> = ReturnType<UniRequestType<T>>;

/**
 * header请求头的返回值整理
 */
function returnHeadreValue(header: any) {
	if (!header) {
		return HEADER;
	} else {
		// 处理请求头
		if (!header['content-type'] && !header['contentType']) {
			header['content-type'] = HEADER['content-type'];
		} else if (header['contentType']) {
			header['content-type'] = header['contentType'];
			delete header.contentType;
		}
		return header;
	}
}

/** 布朗参数检测 */
function checkBoolean(data: object, property: string) {
	return property in data && isBoolean(data[property as keyof typeof data]);
}

type FrequentRecord = {
	[key: string]: {
		timer: number;
		lastTime: number;
		timeout?: NodeJS.Timeout;
		requestFrequently: boolean;
	};
};

/** 检测请求是否过于频繁 */
const checkFrequently = (() => {
	const record: FrequentRecord = {};
	function _delayClean(data: FrequentRecord[string], timeoutTime: number) {
		if (!data) {
			return;
		}
		if (data.timeout) {
			clearTimeout(data.timeout);
		}
		data.timeout = setTimeout(() => {
			data.requestFrequently = false;
			data.timer = 0;
		}, timeoutTime);
	}
	return function (url: string, limit: number, checkTime: number) {
		if (!(url in record)) {
			record[url] = {
				timer: 0,
				lastTime: performance.now(),
				timeout: undefined,
				requestFrequently: false,
			};
		}
		const target = record[url];
		const nowTime = performance.now();
		if (nowTime - target.lastTime < checkTime) {
			target.timer++;
		}
		target.lastTime = nowTime;
		if (target.timer >= limit) {
			target.requestFrequently = true;
			_delayClean(target, limit * checkTime);
		}
		return target.requestFrequently;
	};
})();

/**
 * 请求参数处理
 * @param data 请求参数
 * @param resolve
 * @param reject
 * @param isFIle 是否是文件对象，文件对象不传contentType
 **/
export function checkOptions(
	this: RequestObject,
	data: any,
	resolve: ResolveFunc<string | AnyObject | ArrayBuffer>,
	reject: RejectFunc,
	isFile?: boolean,
): RequestOptions | undefined {
	if (!isBoolean(isFile)) {
		// 默认不是文件传输
		isFile = false;
	}

	// 请求的传参参数判断
	if (!data.hasOwnProperty('url')) {
		// 路径
		throw new Error('Request object needs url value');
	} else {
		if (data.hasOwnProperty('base')) {
			if (data.base === '' && data.url.startsWith('/')) {
				// 如果没有base值且第一个字符为/，删除/
				data.url = data.url.slice(1);
			} else {
				data.url = data.base + data.url;
			}
		}
		if (!data.url.startsWith('http')) {
			data.url = GLOBAL_URL + data.url; // 完整路径
		}
	}

	// #ifdef H5
	const origin = new URL(data.url).origin ?? '';
	if (origin in DomainMap) {
		data.url = DomainMap[origin] + data.url.slice(origin.length);
	}
	// #endif

	const url = data.url;

	if (!checkBoolean(data, 'frequent')) {
		data.frequent = true;
	}
	const requestFrequently = checkFrequently(
		url,
		data.frequentLimit ?? this.frequentLimit,
		data.frequentCheckTime ?? this.frequentCheckTime,
	);
	if (requestFrequently) {
		throw new Error('Request too frequently');
	}

	if (!checkBoolean(data, 'cache')) {
		data.cache = true;
	}
	if (!checkBoolean(data, 'single')) {
		data.single = false;
	}
	if (!checkBoolean(data, 'sync')) {
		data.sync = false;
	}
	if (!('cacheTime' in data) || typeof data.cacheTime !== 'number' || data.cacheTime < 0) {
		data.cacheTime = this.cacheTime;
	}

	if (!isFile && data.cache && url in this.cacheList) {
		const nowTime = performance.now();
		if (this.cacheList[url]) {
			const target = this.cacheList[url];
			if (target.timeid) {
				clearTimeout(target.timeid);
			}
			// 检查缓存
			if (nowTime - target.lastTime > data.cacheTime) {
				// 缓存过期
				delete this.cacheList[url];
			} else if (target.data) {
				// 非文件上传且没有配置cache属性为false，则进行缓存的获取
				resolve(target.data);
				target.timeid = setTimeout(() => {
					delete this.cacheList[url];
				}, data.cacheTime);
				return;
			} else {
				delete this.cacheList[url];
			}
		} else {
			delete this.cacheList[url];
		}
	}

	if (!isFile) {
		data['header'] = returnHeadreValue(data['header']); // 请求头数据
		// 请求头
		if (data['content-type']) {
			data['header']['content-type'] = data['content-type'];
		} else if (data['contentType']) {
			data['header']['content-type'] = data['contentType'];
		}
	}

	if (data.hasOwnProperty('token')) {
		if (data['token']) {
			// 如果有token属性，就放入header中
			data['header'].token = data['token'];
		} else if (data['header'].hasOwnProperty('token')) {
			// 如果token属性传了空值并且header中也有token，就删除header中的token
			delete data['header'].token;
		}
		delete data['token'];
	} else {
		// 没有传token数据就从缓存中查看是否有token数据
		if (uni.getStorageSync('token')) {
			data['header'].token = uni.getStorageSync('token');
		}
	}

	// 请求回调统一配置
	data.success = (res: UniApp.RequestSuccessCallbackResult) => {
		if (res.statusCode === 200) {
			resolve(res.data);
			if (!isFile && data.cache) {
				// 缓存数据
				this.cacheList[url] = {
					data: res.data,
					lastTime: performance.now(),
					timeid: setTimeout(() => {
						delete this.cacheList[url];
					}, data.cacheTime),
				};
			}
		} else {
			reject(res.data);
		}
	};
	data.fail = function (err: UniApp.GeneralCallbackResult) {
		reject(err);
	};
	data.complete = () => {
		if (url && this.singleList.hasOwnProperty(url)) {
			// 请求结束后删除队列中此次请求的记录
			delete this.singleList[url];
		}
		if (data.sync && url in this.syncList) {
			const target = this.syncList[url];
			target.running = false;
			// 同步队列执行
			if (target.list.length > 0) {
				const func = target.list.shift();
				func?.();
			} else {
				delete this.syncList[url];
			}
		}
	};
	return data;
}

/**
 * 判断是否需要取消请求
 * @param this
 * @param options
 * @param obj
 */
function _request_abort(
	this: RequestObject,
	options: RequestOptions,
	obj: UniNamespace.RequestTask | UniNamespace.DownloadTask | UniNamespace.UploadTask,
) {
	if (options.url) {
		const url = options.url;
		if (options.single) {
			// 判断同一个接口得请求是否结束，同一个接口的前一个请求未结束则终止前一个请求
			if (url in this.singleList && this.singleList[url] !== obj) {
				this.singleList[url]?.abort(); // 终止请求
				this.singleList[url] = obj; // 队列中的请求覆盖为此次请求
			} else {
				this.singleList[url] = obj;
			}
		}
	}
}

/**
 * 执行uni请求
 * @param this
 * @param options
 * @param type
 */
export function _uni_request<T extends UniRequestKey>(this: RequestObject, options: RequestOptions, type: T) {
	const url = options.url;
	function _u(this: RequestObject) {
		if (options.sync) {
			this.syncList[url].running = true;
		}
		// @ts-ignore
		const obj: UniRequestReturn<T> = _uni_request_funcs[type](options);
		_request_abort.call(this, options, obj);
	}
	if (options.sync) {
		if (url in this.syncList) {
			// 判断同步队列是否已开启
			this.syncList[url].list.push(_u.bind(this));
		} else {
			this.syncList[url] = {
				running: true,
				list: [],
			};
			_u.call(this);
		}
	} else {
		_u.call(this);
	}
}
