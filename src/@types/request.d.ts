type RequestMethod = UniNamespace.RequestOptions.method;

interface RequestOptions {
	url: string;
	method: RequestMethod;
	data?: string | AnyObject | ArrayBuffer;
	contentType?: string;
	'content-type'?: string;
	header?: any;
	syncRequest?: boolean;
}

type RequestOptionsUsed = Omit<RequestOptions, 'method'>;

type AllRequestFunc = ['get', 'post', 'Delete', 'put', 'uploadFile', 'downloadFile'];

type RequestList = {
	[key: string]: UniNamespace.RequestTask | UniNamespace.DownloadTask | UniNamespace.UploadTask;
};

type RequestFunc = (options: RequestOptionsUsed) => Promise<string | AnyObject | ArrayBuffer>;

type RequestObject = {
	requestList: RequestList;
} & {
	[K in keyof AllRequestFunc as AllRequestFunc[K] & string]: RequestFunc;
};
