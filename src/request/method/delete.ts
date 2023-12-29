import { checkOptions, _uni_request } from '../config';

/**
 * delete请求
 * @param options 参数对象：请求路径(url)必填，请求参数(data)，请求头(header)
 **/
export function deleteRequest(
	this: RequestObject,
	options: RequestOptionsUsed,
): Promise<string | AnyObject | ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const settintOptions = checkOptions.call(this, options, resolve, reject); // 传参数据整理
		if (settintOptions) {
			settintOptions.method = 'DELETE';
			_uni_request.call(this, settintOptions, 'default');
		}
	});
}
