import { request } from '@common/request';
import { mergeWithDomainDefault } from '@/config';

type Options = PickRequireTypes<RequestOptions, [boolean | undefined, number | undefined]>;

/**
 * 域名后拼接路径参数请求数据
 * @param params
 * @returns
 */
export function suffixWithPathParam(params: string, options?: Options) {
	const {
		sync = false,
		cache = true,
		single = false,
		frequent = true,
		cacheTime = void 0,
		frequentCheckTime = void 0,
		frequentLimit = void 0,
	} = options || {};
	return request.Post({
		url: mergeWithDomainDefault(params),
		sync,
		cache,
		single,
		frequent,
		cacheTime,
		frequentCheckTime,
		frequentLimit,
	});
}
