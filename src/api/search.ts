import { getDomainInfo } from './domain';
import { request } from './request';

export function searchInDingdian(value: string) {
	return request.post({
		url: getDomainInfo('dingdian', 'search'),
		data: {
			searchkey: value,
			Submit: '搜索',
		},
	});
}
