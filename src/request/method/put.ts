import { checkOptions, _uni_request, _request_cache } from '../config.js';

/**
 * put请求
 * @param options 参数对象：请求路径(url)必填，请求参数(data)，请求头(header)
 **/
export function putRequest(
	this: RequestObject,
	options: RequestOptionsUsed,
): Promise<string | AnyObject | ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const settingOptions = checkOptions.call(this, options, resolve, reject); // 传参数据整理
		if (settingOptions) {
			settingOptions.method = 'PUT';
			const obj = _uni_request(settingOptions); // requestTask对象
			_request_cache.call(this, settingOptions, obj);
		}
	});
}
