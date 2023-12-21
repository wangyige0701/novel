import { request } from '../request';
import { mergeWithDomainDefault } from '@/config';

/**
 * 获取对应小说主页数据
 * @param homeId
 * @returns
 */
export function home(homeId: string) {
	return request.Post({
		url: mergeWithDomainDefault(homeId),
	});
}
