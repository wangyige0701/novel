import { request } from '../request';
import { getInterfaceData } from '@/config';

/**
 * 顶点小说查询接口请求
 * @param value
 * @returns
 */
export function search(value: string) {
	return request.Post({
		url: getInterfaceData('dingdian', 'domain', 'search'),
		data: {
			searchkey: value,
			Submit: '搜索',
		},
	});
}
