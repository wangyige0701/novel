import { getDomainInfo } from './domain';
import { request } from './request';
import { TARGET } from './request/config';

export function search(searchValue: string) {
	return request.post({
		url: getDomainInfo(TARGET, 'search'),
		data: {
			searchkey: searchValue,
			Submit: '搜索',
		},
	});
}
