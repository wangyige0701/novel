import type { PathOptions, PathParams } from '@/@types/common/path';
import { Fn, isObject } from '@wang-yige/utils';

export function params(url: string, params?: PathParams) {
	if (!params || !isObject(params)) {
		return url;
	}
	const result = [];
	for (const key in params) {
		if (params.hasOwnProperty(key)) {
			result.push(`${key}=${params[key]}`);
		}
	}
	if (!result.length) {
		return url;
	}
	return `${url}?${result.join('&')}`;
}

export function callback(
	resolve: Fn<[any], any>,
	reject: Fn<[any], any>,
	options?: PathOptions,
): Pick<PathOptions, 'success' | 'fail'> {
	return {
		success: res => {
			if (options?.success) {
				options.success(res);
			}
			resolve(res);
		},
		fail: err => {
			if (options?.fail) {
				options.fail(err);
			}
			reject(err);
		},
	};
}
