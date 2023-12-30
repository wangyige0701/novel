import { getInterfaceDataDefault } from '@/config';

// #ifdef H5
import ProxyConfig from './proxy';
import { isArray, isBoolean } from '@/utils/types';

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

let requestFrequently = false;

/** 检测请求是否过于频繁 */
const checkFrequently = (() => {
	let timer: number = 0;
	let lastTime = performance.now();
	let timeout: NodeJS.Timeout;
	function _delayClean() {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			requestFrequently = false;
			timer = 0;
		}, 5000);
	}
	return function () {
		const nowTime = performance.now();
		if (nowTime - lastTime < 500) {
			timer++;
		}
		lastTime = nowTime;
		if (timer >= 10) {
			requestFrequently = true;
			_delayClean();
		}
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
	checkFrequently();
	if (requestFrequently) {
		throw new Error('Request too frequently');
	}

	if (typeof isFile === 'undefined') {
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

	const url = data.url;
	if (!isFile && data.cache && url in this.cacheList) {
		// 检查缓存
		if (this.cacheList[url] && this.cacheList[url].data) {
			// 非文件上传且没有配置cache属性为false，则进行缓存的获取
			resolve(this.cacheList[url].data);
			if (this.cacheList[url].timeid) {
				clearTimeout(this.cacheList[url].timeid);
			}
			this.cacheList[url].timeid = setTimeout(() => {
				delete this.cacheList[url];
			}, data.cacheTime);
			return;
		} else {
			delete this.cacheList[url];
		}
	}

	if (data.sync && !(url in this.syncList)) {
		// 同步执行队列
		this.syncList[url] = [];
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
			// 同步队列执行
			if (this.syncList[url].length > 0) {
				const func = this.syncList[url].shift();
				func?.();
			} else {
				delete this.syncList[url];
			}
		}
	};
	return data;
}

/**
 * 执行uni请求
 * @param this
 * @param options
 * @param type
 */
export function _uni_request<T extends UniRequestKey>(this: RequestObject, options: RequestOptions, type: T) {
	function _u(this: RequestObject) {
		// @ts-ignore
		const obj: UniRequestReturn<T> = _uni_request_funcs[type](options);
		_request_abort.call(this, options, obj);
	}
	const url = options.url;
	if (options.sync) {
		if (url in this.syncList && isArray(this.syncList[url])) {
			// 判断同步队列是否已开启
			this.syncList[url].push(_u.bind(this));
		} else {
			this.syncList[url] = [];
			_u.call(this);
		}
	} else {
		_u.call(this);
	}
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
