import { checkOptions, _uni_request } from '../main/config.js';

/**
 * 文件上传请求
 * @param options 参数对象：请求路径(url)必填，文件上传列表(files/filePath，使用 files 时，filePath 和 name 不生效)，请求头(header)
 **/
export function uploadFile(
	this: RequestObject,
	options: RequestOptionsUsed,
): Promise<string | AnyObject | ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const settingOptions = checkOptions.call(this, options, resolve, reject, true); // 传参数据整理
		if (!settingOptions || !settingOptions.hasOwnProperty('fileType')) {
			// 上传文件需要fileType参数，image/video/audio（仅支付宝小程序）
			throw new Error('Request object needs fileType value');
		}
		if (settingOptions) {
			_uni_request.call(this, settingOptions, 'uploadFile');
		}
	});
}
