import log from '@/log';
import { searchInDingdian } from '@/api/search';
import { parseHTML, query } from '@/core';

const listSelector = 'div.container > div.row > div.layout.layout2.layout-co18 > ul.txt-list.txt-list-row5 > li';

function parseHTMLString(html: string) {
	const parse = parseHTML(html);
	// 获取列表元素并去除
	const liTargets = query(parse).$body().$all(listSelector).splice(1);
	return liTargets.map(item => {
		return {
			name: query(item).$('span.s2 > a'),
			author: query(item).$('span.s4'),
		};
	});
}

export function getListData(searchContent: string) {
	return new Promise(resolve => {
		searchInDingdian(searchContent)
			.then(res => {
				return parseHTMLString(String(res));
			})
			.then(data => {
				resolve(data);
			})
			.catch(err => {
				log.error(err);
			});
	});
}
