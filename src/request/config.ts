import { getInterfaceDataDefault } from '@/config';

// #ifdef H5
import ProxyConfig from './proxy';

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

	const url = data.url;
	// 检查缓存
	if (!isFile && data.cache !== false && url in this.cacheList && this.cacheList[url] && this.cacheList[url].data) {
		resolve(this.cacheList[url].data);
		if (this.cacheList[url].timeid) {
			clearTimeout(this.cacheList[url].timeid);
		}
		this.cacheList[url].timeid = setTimeout(() => {
			delete this.cacheList[url];
		}, this.cacheTime);
		return;
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
			if (!isFile && data.cache !== false) {
				this.cacheList[url] = {
					data: res.data,
					timeid: setTimeout(() => {
						delete this.cacheList[url];
					}, this.cacheTime),
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
		if (url && this.requestList.hasOwnProperty(url)) {
			// 请求结束后删除队列中此次请求的记录
			delete this.requestList[url];
		}
	};
	return data;
}

export function _uni_request(options: UniNamespace.RequestOptions) {
	return (uni.request as (options: UniNamespace.RequestOptions) => UniNamespace.RequestTask)(options);
}

export function _request_cache(
	this: RequestObject,
	options: RequestOptions,
	obj: UniNamespace.RequestTask | UniNamespace.DownloadTask | UniNamespace.UploadTask,
) {
	if (options.url) {
		const url = options.url;
		if (options.asyn === true) {
			// 判断同一个接口得请求是否结束，同一个接口的前一个请求未结束则终止前一个请求
			if (url in this.requestList && this.requestList[url] !== obj) {
				this.requestList[url]?.abort(); // 终止请求
				this.requestList[url] = obj; // 队列中的请求覆盖为此次请求
			} else {
				this.requestList[url] = obj;
			}
		}
	}
}