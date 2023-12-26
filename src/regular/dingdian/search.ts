import type { ListReturnVal, ListTarget } from '../@types/search';
import { search } from '@/api/dingdian/search';
import { parseHTML, query, queryAttr, queryText } from '@/core';

/** 获取小说类型数据 */
const getTypeContent = /(?:^\[?([^\[\]]*)\]?$)|(?:^(.*)$)/;

const listSelector = 'div.container > div.row > div.layout.layout2.layout-co18 > ul.txt-list.txt-list-row5 > li';

/**
 * 解析html文本并获取需要数据
 * @param html
 * @returns
 */
function parseHTMLString(html: string): ListTarget[] {
	const parse = parseHTML(html);
	// 获取列表元素并去除
	const liTargets = query(parse).$body().$all(listSelector).splice(1);
	return liTargets.map(item => {
		const targetChild = query(item);
		const novel = targetChild.$('span.s2 > a');
		const typeValue = queryText(targetChild.$('span.s1')).trim().match(getTypeContent);
		return {
			name: queryText(novel),
			href: queryAttr(novel, 'href'),
			author: queryText(targetChild.$('span.s4')),
			type: typeValue?.[1] ?? typeValue?.[2] ?? '',
		};
	});
}

/**
 * 查询列表数据整理
 * @param data
 * @returns
 */
function getHTMLText(data: ListTarget) {
	const { name: novelName, author: authorName, type, href } = data;
	if (!novelName || !authorName) {
		return;
	}
	return {
		name: novelName,
		author: authorName,
		href,
		type,
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
 * @param merge 不传返回未合并的数据，为true根据作者名进行合并，为desc或者asc默认合并同时进行排序
 * - desc 降序
 * - asc 升序
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
