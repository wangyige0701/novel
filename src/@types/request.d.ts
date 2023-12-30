type RequestMethod = UniNamespace.RequestOptions.method;

interface RequestOptions {
	url: string;
	method: RequestMethod;
	data?: string | AnyObject | ArrayBuffer;
	contentType?: string;
	'content-type'?: string;
	header?: any;
	/** 请求是否只能存在一个，即同一个域名、接口、参数相同时，取消上一个请求，默认false */
	single?: boolean;
	/** 请求数据是否缓存，默认缓存，默认true */
	cache?: boolean;
	/** 手动设置缓存过期时间 */
	cacheTime?: number;
	/** 请求是否同步进行，即只有上一个请求完成才能继续下一个请求，默认false */
	sync?: boolean;
}

type RequestOptionsUsed = Omit<RequestOptions, 'method'>;

type AllRequestFunc = ['Get', 'Post', 'Delete', 'Put', 'UploadFile', 'DownloadFile'];

type SingleList = {
	[key: string]: UniNamespace.RequestTask | UniNamespace.DownloadTask | UniNamespace.UploadTask;
};

type CacheList = {
	[key: string]: {
		/** 记录上一次更新数据的时间，如果超过了时间则放开请求更新数据 */
		lastTime: number;
		timeid: NodeJS.Timeout;
		data: any;
	};
};

type SyncList = {
	[key: string]: {
		running: boolean;
		list: Function[];
	};
};

type RequestFunc = (options: RequestOptionsUsed) => Promise<string | AnyObject | ArrayBuffer>;

type RequestObject = {
	/** 缓存时间 */
	cacheTime: number;
	/** 单一请求，即当前请求会取消上一次未完成的相同请求 */
	singleList: SingleList;
	/** 是否通过缓存获取 */
	cacheList: CacheList;
	/** 请求是否同步进行 */
	syncList: SyncList;
} & {
	[K in keyof AllRequestFunc as AllRequestFunc[K] & string]: RequestFunc;
};
