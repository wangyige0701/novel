import { getRequest } from './method/get';
import { postRequest } from './method/post';
import { deleteRequest } from './method/delete';
import { putRequest } from './method/put';
import { uploadFile } from './method/uploadFile';
import { downloadFile } from './method/downloadFile';

export const request: RequestObject = {
	// 缓存时间，单位ms
	cacheTime: 1 * 60 * 1000,

	// 请求队列
	requestList: {},

	// 请求数据缓存队列
	cacheList: {},

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
