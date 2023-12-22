import type { HTMLParseTag } from '@/core/@types/parse';
import { search } from '@/api/dingdian/search';
import { parseHTML, query, queryText } from '@/core';

type ListTarget = {
	name: HTMLParseTag | undefined;
	author: HTMLParseTag | undefined;
};

type ListReturnVal = { name: string; author: string; href: string };

const listSelector = 'div.container > div.row > div.layout.layout2.layout-co18 > ul.txt-list.txt-list-row5 > li';

function parseHTMLString(html: string): ListTarget[] {
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

function getHTMLText(data: ListTarget) {
	const { name, author } = data;
	if (!name || !author) {
		return;
	}
	const nameChild = name.children[0];
	const authorChild = author.children[0];
	const href = name.attrs[0].value;
	const novelName = queryText(nameChild);
	const authorName = queryText(authorChild);
	if (!novelName || !authorName) {
		return;
	}
	return {
		name: novelName,
		author: authorName,
		href,
	};
}

/**
 * 通过作者名合并列表
 * @param list
 * @param sort desc - 降序；  asc - 升序
 * @returns
 */
function mergeByAuthor(list: ListReturnVal[], sort: 'desc' | 'asc' | undefined = void 0) {
	const nameList: string[] = [];
	const result = list.reduce(
		(prev, curr) => {
			if (nameList.includes(curr.author)) {
				prev.find(item => item.author === curr.author)!.value.push(curr);
			} else {
				nameList.push(curr.author);
				prev.push({
					author: curr.author,
					value: [curr],
				});
			}
			return prev;
		},
		<Array<{ author: string; value: ListReturnVal[] }>>[],
	);
	if (sort === 'asc' || sort === 'desc') {
		// asc: 升序，desc: 降序
		return result.sort(({ value: fontVal }, { value: backVal }) =>
			sort === 'asc' ? fontVal.length - backVal.length : backVal.length - fontVal.length,
		);
	}
	return result;
}

/**
 * 获取顶点小说网站查询列表
 * @param searchContent
 * @param merge 不传返回未合并的数据，为true根据作者名进行合并，为desc或者asc进行排序，desc降序、asc升序
 * @returns
 */
export function getListData(
	searchContent: string,
	merge: true | 'desc' | 'asc',
): Promise<ReturnType<typeof mergeByAuthor>>;
export function getListData(searchContent: string, merge?: undefined): Promise<ListReturnVal[]>;
export function getListData(searchContent: string, merge: true | 'desc' | 'asc' | undefined = void 0) {
	return new Promise((resolve, reject) => {
		search(searchContent)
			.then(res => {
				return parseHTMLString(String(res));
			})
			.then(data => {
				return <ListReturnVal[]>data.map(item => getHTMLText(item)).filter(Boolean);
			})
			.then(data => {
				if (merge === true || merge === 'desc' || merge === 'asc') {
					return resolve(mergeByAuthor(data, merge === true ? void 0 : merge));
				}
				resolve(data);
			})
			.catch(reject);
	});
}
