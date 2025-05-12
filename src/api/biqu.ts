import type { IDType } from '@/@types';
import { Request } from '@/common/request';
import { useSearchProxyStore as proxy } from '@/store/proxy';

export function search(keyword: string) {
	return Request.post({
		url: `${proxy().path}/search/`,
		data: {
			searchkey: keyword,
			submit: '',
		},
		header: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});
}

export function book(src: IDType) {
	return Request.get({
		url: proxy().path + src,
	});
}

export function chapter(src: IDType) {
	return Request.get({
		url: proxy().path + src,
	});
}
