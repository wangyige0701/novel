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
