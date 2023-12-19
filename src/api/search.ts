import { getDomainInfo } from './domain';
import { request } from './request';

export function search(searchValue: string) {
	return request.post({
		url: getDomainInfo(NetRequest.TARGET, 'search'),
		data: {
			searchkey: searchValue,
			Submit: '搜索',
		},
	});
}
