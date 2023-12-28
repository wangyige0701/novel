import { request } from '@/request';
import { mergeWithDomainDefault } from '@/config';

/**
 * 域名后拼接路径参数请求数据
 * @param params
 * @returns
 */
export function suffixWithPathParam(params: string) {
	return request.Post({
		url: mergeWithDomainDefault(params),
	});
}
