import { getRequest } from './method/get';
import { postRequest } from './method/post';
import { deleteRequest } from './method/delete';
import { putRequest } from './method/put';
import { uploadFile } from './method/uploadFile';
import { downloadFile } from './method/downloadFile';

export const request: RequestObject = {
	/** 请求频率限制，默认10次 */
	frequentLimit: 10,

	/** 请求频率检测间隔，默认500毫秒 */
	frequentCheckTime: 500,

	/** 缓存时间，默认5000毫秒 */
	cacheTime: 5 * 1000,

	/** 单一请求管理队列 */
	singleList: {},

	/** 请求数据缓存队列 */
	cacheList: {},

	/** 同步请求管理队列 */
	syncList: {},

	/**
	 * get请求
	 **/
	Get: getRequest,

	/**
	 * post请求
	 **/
	Post: postRequest,

	/**
	 * delete请求
	 **/
	Delete: deleteRequest,

	/**
	 * put请求
	 **/
	Put: putRequest,

	/**
	 * 文件上传请求
	 **/
	UploadFile: uploadFile,

	/**
	 * 文件下载请求
	 **/
	DownloadFile: downloadFile,
};
