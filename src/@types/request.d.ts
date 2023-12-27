type RequestMethod = UniNamespace.RequestOptions.method;

interface RequestOptions {
	url: string;
	method: RequestMethod;
	data?: string | AnyObject | ArrayBuffer;
	contentType?: string;
	'content-type'?: string;
	header?: any;
	/** 请求是否异步执行，即同一个域名、接口、参数相同时，取消上一个请求 */
	asyn?: boolean;
	/** 请求数据是否缓存，默认缓存 */
	cache?: boolean;
}

type RequestOptionsUsed = Omit<RequestOptions, 'method'>;

type AllRequestFunc = ['Get', 'Post', 'Delete', 'Put', 'UploadFile', 'DownloadFile'];

type RequestList = {
	[key: string]: UniNamespace.RequestTask | UniNamespace.DownloadTask | UniNamespace.UploadTask;
};

type CacheList = {
	[key: string]: {
		timeid: NodeJS.Timeout;
		data: any;
	};
};

type RequestFunc = (options: RequestOptionsUsed) => Promise<string | AnyObject | ArrayBuffer>;

type RequestObject = {
	cacheTime: number;
	requestList: RequestList;
	cacheList: CacheList;
} & {
	[K in keyof AllRequestFunc as AllRequestFunc[K] & string]: RequestFunc;
};
