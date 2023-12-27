import { checkOptions, _request_cache } from '../config.js';

/**
 * 文件下载请求
 * @param options 参数对象：请求路径(url)必填，请求头(header)
 **/
export function downloadFile(
	this: RequestObject,
	options: RequestOptionsUsed,
): Promise<string | AnyObject | ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const settingOptions = checkOptions.call(this, options, resolve, reject, true); // 传参数据整理
		if (settingOptions) {
			type Func = (options: UniNamespace.DownloadFileOption) => UniNamespace.DownloadTask;
			const obj: UniNamespace.DownloadTask = (uni.downloadFile as Func)(settingOptions); // requestTask对象
			_request_cache.call(this, settingOptions, obj);
		}
	});
}
