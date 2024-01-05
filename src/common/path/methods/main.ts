import { isObject } from '@/utils/types';

type ParamsType = {
	[key: string]: number | boolean | string;
};

/** 配置中的参数属性 */
export type OptionsParams = {
	params?: ParamsType;
};

type MethodTypes = 'nagivateBack' | 'nagivateTo' | 'redirectTo' | 'reLaunch';

type OptionsUrlType = {
	url: string | HBuilderX.PageURIString;
} & OptionsParams;

type OptionsCallbackType = {
	success?: (res: any) => void;
	fail?: (res: any) => void;
	complete?: (res: any) => void;
};

type OptionsWithUrl = OptionsCallbackType & OptionsUrlType;

type CheckOptions<T extends MethodTypes> = T extends 'nagivateBack' ? OptionsCallbackType : OptionsWithUrl;

/**
 * 根据对象生成一个url中的参数字符
 * @param datas
 * @returns
 */
export function createURLParam(datas: ParamsType, start: '?' | '&' = '?'): string {
	if (!datas) {
		return '';
	}
	if (!isObject(datas)) {
		throw new Error('Param datas must be object');
	}
	let result = start as string;
	for (const key in datas) {
		result += `${key}=${datas[key]}&`;
	}
	if (result.endsWith('&')) {
		result = result.slice(0, result.length - 1);
	}
	return result;
}

/**
 * url参数调整
 * @param url
 * @param params
 * @returns
 */
export function urlArrange(url: string, params: ParamsType): string {
	const start = /[^?]*\?.*/.test(url as string) ? '&' : '?';
	const paramsStr = createURLParam(params, start);
	url += paramsStr;
	return url;
}

/**
 * 参数整理
 * @param resolve
 * @param reject
 * @param options
 * @returns
 */
export function optionsArrange<T extends MethodTypes>(
	resolve: ResolveFunc<any>,
	reject: RejectFunc,
	type: T,
	options: CheckOptions<T>,
): CheckOptions<T> {
	let _success = options.success ?? void 0;
	let _fail = options.fail ?? void 0;
	let _complete = options.complete ?? void 0;
	if (type !== 'nagivateBack') {
		const copy = options as OptionsWithUrl;
		if (copy.url) {
			let url = copy.url;
			if (copy.params) {
				url = urlArrange(url as string, copy.params);
				delete copy.params;
			}
			copy.url = url;
		}
	}
	options.success = (res: any) => {
		_success?.(res);
		resolve(res);
	};
	options.fail = (err: any) => {
		_fail?.(err);
		reject(err);
	};
	options.complete = (res: any) => {
		_complete?.(res);
	};
	return options;
}
