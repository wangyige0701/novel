import { getRequest } from './method/get';
import { postRequest } from './method/post';
import { deleteRequest } from './method/delete';
import { putRequest } from './method/put';
import { uploadFile } from './method/uploadFile';
import { downloadFile } from './method/downloadFile';

export const request: RequestObject = {
	// 请求队列
	requestList: {},

	/**
	 * get请求
	 **/
	get: getRequest,

	/**
	 * post请求
	 **/
	post: postRequest,

	/**
	 * delete请求
	 **/
	Delete: deleteRequest,

	/**
	 * put请求
	 **/
	put: putRequest,

	/**
	 * 文件上传请求
	 **/
	uploadFile: uploadFile,

	/**
	 * 文件下载请求
	 **/
	downloadFile: downloadFile,
};
