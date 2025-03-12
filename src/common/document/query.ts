import type {
	SelectPosition,
	SelectorInfo,
	HTMLParse,
	HTMLParseTag,
	HTMLParseText,
	Query,
	QueryResult,
	HTMLParent,
} from '@/@types/common/document';
import { firstLowerCase, firstUpperCase, isArray, isString, splitByUpper } from '@wang-yige/utils';
import { Combiner } from './combiner';
import { handleSelector } from './selector';

type TravselCalback = (tag: HTMLParseTag, index: number, parent?: HTMLParent) => boolean;

/**
 * 遍历树
 * @param deep 是否遍历整棵树，为false则只遍历一层
 * @param data
 * @param callback
 * @param parent
 */
function traversal(
	deep: boolean,
	data: HTMLParse[],
	callback: TravselCalback,
	parent?: HTMLParent,
): undefined | SelectPosition {
	const queue: HTMLParseTag[] = [];
	let index = 0; // 只在tag处自增
	for (const item of data) {
		if (item.type === 'tag') {
			const parentVal = parent ? parent : void 0;
			if (callback(item, index, parentVal)) {
				return {
					parent: parentVal,
					target: item,
					index,
				};
			}
			deep && queue.push(item);
			index++;
		}
	}
	if (!deep) {
		return;
	}
	while (queue.length) {
		const item = queue.shift();
		if (item && item.children && item.children.length) {
			// 遍历子元素，传入当前元素作为父元素
			const result = traversal(deep, item.children, callback, item);
			if (result) {
				return result;
			}
		}
	}
	return;
}

/**
 * 遍历树获取所有匹配对象
 */
function traversal_all(deep: boolean, data: HTMLParse[], callback: TravselCalback): SelectPosition[] {
	const result: SelectPosition[] = [];
	traversal(deep, data, (tag, index, parent) => {
		if (callback(tag, index, parent)) {
			result.push({
				parent,
				target: tag,
				index,
			});
		}
		return false;
	});
	return result;
}

/**
 * 广度优先遍历树
 * @param data
 * @param callback
 * @param all 是否匹配树内所有满足条件的数据
 * @returns 返回匹配到的元素及其索引，以及父元素
 */
function deep(data: HTMLParse[], callback: TravselCalback, all: true): SelectPosition[];
function deep(data: HTMLParse[], callback: TravselCalback, all?: false): SelectPosition | undefined;
function deep(data: HTMLParse[], callback: TravselCalback, all: boolean = false) {
	if (all) {
		return traversal_all(true, data, callback);
	}
	return traversal(true, data, callback);
}

/**
 * 不进行深度递归，只在第一层检测
 * @param data
 * @param callback
 */
function shallow(data: HTMLParse[], callback: TravselCalback, all: true): SelectPosition[];
function shallow(data: HTMLParse[], callback: TravselCalback, all?: false): SelectPosition | undefined;
function shallow(data: HTMLParse[], callback: TravselCalback, all: boolean = false) {
	if (all) {
		return traversal_all(false, data, callback);
	}
	return traversal(false, data, callback);
}

/**
 * 校验单个选择器
 * @param matchTarget
 * @param selector
 */
function handleSelectorType(matchTarget: HTMLParseTag, selector: SelectorInfo) {
	if (selector.type === 'tag') {
		if (selector.data === '*') {
			return true;
		}
		return matchTarget.tag === selector.data;
	}
	if (selector.type === 'attr') {
		const selectorAttrs = selector.data;
		// 遍历选择器筛选的属性列表，必须全部匹配，才能返回 true
		for (const attr of selectorAttrs) {
			// 筛选属性时，find 方法一定会筛选首次出现的，所以不需要对同属性过滤进行处理
			const attrTarget = matchTarget.attrs.find(item => item.name === attr.key);
			if (!attrTarget) {
				return false;
			}
			if (!attr.value && attrTarget.value !== attrTarget.name && attrTarget.value !== '') {
				return false;
			}
			if (attrTarget.value !== attr.value) {
				return false;
			}
		}
		return true;
	}
	if (selector.type === 'class') {
		const cls = matchTarget.attrs.find(item => item.name === 'class');
		if (!cls || !cls.value) {
			return false;
		}
		const clss = cls.value.split(/\s+/);
		const selectorClasses = selector.data;
		for (const selectorClass of selectorClasses) {
			if (!clss.includes(selectorClass)) {
				return false;
			}
		}
		return true;
	}
	if (selector.type === 'id') {
		const id = matchTarget.attrs.find(item => item.name === 'id');
		if (!id || !id.value) {
			return false;
		}
		return id.value === selector.data;
	}
	return false;
}

/**
 * 通过选择器进行校验
 * @param matchTarget
 * @param selectors
 */
function handleSelectorMatched(matchTarget: HTMLParseTag, selectors: SelectorInfo[]) {
	for (const selector of selectors) {
		if (!handleSelectorType(matchTarget, selector)) {
			return false;
		}
	}
	return true;
}

/**
 * 根据组合器检索
 * @param combinator
 * @param parent
 * @param target
 * @param index 匹配兄弟元素时需要通过索引进行定位
 */
function handleCombinators(
	combinator: Combiner,
	selector: SelectorInfo[],
	target: HTMLParseTag,
	index: number,
	parent: HTMLParent | undefined,
): SelectPosition[] {
	let useFunc: typeof deep | typeof shallow = shallow;
	let params: [HTMLParse[], TravselCalback] | undefined = void 0;
	if (combinator === Combiner.DESCENDANT) {
		// 后代
		params = [target.children, tag => handleSelectorMatched(tag, selector)];
		useFunc = deep;
	} else if (combinator === Combiner.CHILD) {
		// 子元素
		params = [target.children, tag => handleSelectorMatched(tag, selector)];
	} else if (combinator === Combiner.NEXT_SIBLING) {
		// 接续兄弟
		if (parent) {
			params = [[parent], (tag, i) => i === index + 1 && handleSelectorMatched(tag, selector)];
		}
	} else if (combinator === Combiner.SUBSEQUENT_SIBLING) {
		// 后代兄弟
		if (parent) {
			params = [[parent], (tag, i) => i > index && handleSelectorMatched(tag, selector)];
		}
	}
	if (params) {
		return useFunc(...params, true);
	}
	return [];
}

/**
 * 匹配选择器
 * @param data
 * @param selector
 */
function select(data: HTMLParse[], selectorStr: string, all: true): SelectPosition[];
function select(data: HTMLParse[], selectorStr: string, all: false): SelectPosition | undefined;
function select(data: HTMLParse[], selectorStr: string, all: boolean) {
	const parseResult = handleSelector(selectorStr);
	const matchSuccess: SelectPosition[] = [];
	let index = 0;
	for (const parse of parseResult) {
		index++;
		const { combiner, selector } = parse;
		if (!combiner) {
			// 开始
			matchSuccess.push(...deep(data, tag => handleSelectorMatched(tag, selector), true));
			continue;
		}
		if (matchSuccess.length === 0) {
			return;
		}
		const record: SelectPosition[] = [];
		for (const matchItem of matchSuccess) {
			const result = handleCombinators(combiner, selector, matchItem.target, matchItem.index, matchItem.parent);
			// 最后一层，如果已经匹配到了结果则直接返回
			if (!all && index === parseResult.length && result.length > 0) {
				return result[0];
			}
			record.push(...result);
		}
		matchSuccess.splice(0, matchSuccess.length, ...record);
	}
	if (matchSuccess.length > 0) {
		if (all) {
			return matchSuccess;
		}
		return matchSuccess[0];
	}
	return;
}

/**
 * 将html解析树定位到body位置，并且如果有值则返回一个被数组包裹着的对象
 * @param data
 */
function positionToBody(data: HTMLParse[]): HTMLParse[] {
	const result = deep(data, tag => tag.tag === 'body');
	return result ? [result.target] : [];
}

/**
 * 获取当前元素的文本数据
 * @param data
 */
function queryText(data: HTMLParse | undefined): string {
	if (!data) {
		return '';
	}
	if (data.type === 'text') {
		return data.text;
	}
	if (data.children.length === 0) {
		return '';
	}
	const children = data.children.find(item => item.type === 'text');
	if (!children) {
		return '';
	}
	return (children as HTMLParseText).text || '';
}

function queryAttrs(data: HTMLParse | undefined) {
	if (!data) {
		return [];
	}
	if (data.type === 'text') {
		return [];
	}
	return data.attrs;
}

/**
 * 获取属性值
 * @param data
 * @param key 属性键
 */
function queryAttr(data: HTMLParse | undefined, key: string) {
	if (!data) {
		return '';
	}
	if (data.type === 'text') {
		return '';
	}
	return data.attrs.find(item => item.name === key)?.value || '';
}

function queryClass(data: HTMLParse | undefined, list: true): string[];
function queryClass(data: HTMLParse | undefined, list: boolean): string;
function queryClass(data: HTMLParse | undefined, list: boolean) {
	const result = queryAttr(data, 'class');
	if (list) {
		return result.split(/\s+/);
	}
	return result;
}

function queryStyle(data: HTMLParse | undefined): Record<string, string>;
function queryStyle(data: HTMLParse | undefined, name: string): string;
function queryStyle(data: HTMLParse | undefined, name?: string) {
	const result = queryAttr(data, 'style');
	const styles = {} as Record<string, string>;
	for (const item of result.matchAll(/(?<key>[^;:\s]+)\s*\:\s*(?<value>[^;\s]+)\s*\;?/g)) {
		if (!item.groups) {
			continue;
		}
		const { key, value } = item.groups!;
		const _key = key.trim();
		const _value = value.trim();
		if (isString(name) && _key === name) {
			return _value;
		}
		styles[_key] = _value;
	}
	if (isString(name)) {
		return styles[name] || '';
	}
	return styles;
}

function queryDataset(data: HTMLParse | undefined): Record<string, string>;
function queryDataset(data: HTMLParse | undefined, name: string): string;
function queryDataset(data: HTMLParse | undefined, name?: string) {
	const attrs = queryAttrs(data);
	const datasets = {} as Record<string, string>;
	for (const attr of attrs) {
		const { name, value } = attr;
		if (name.startsWith('data-')) {
			const key = name.slice(5);
			if (!key) {
				continue;
			}
			const _key = firstLowerCase(key.trim().split('-').map(firstUpperCase).join(''));
			if (isString(name) && name === _key) {
				return value.trim();
			}
			datasets[_key] = value.trim();
		}
	}
	if (isString(name)) {
		return datasets[name] || '';
	}
	return datasets;
}

/**
 * 通过解析树进行元素查找，每次只查找一个元素
 */
export function query(data: HTMLParse[] | HTMLParse) {
	if (!isArray(data)) {
		data = [data];
	}
	function queryResult(target: SelectPosition | undefined): QueryResult {
		const result = Object.create(query(target ? target.target : ({} as HTMLParse)));
		result.target = target?.target;
		result.parent = target?.parent;
		result.index = target?.index ?? -1;
		return result;
	}
	function _query(data: HTMLParse[]): Query {
		return {
			$(selector: string) {
				return queryResult(select(data, selector, false));
			},
			$$(selector: string) {
				const target = select(data, selector, true);
				return target.map(queryResult);
			},
			body() {
				return query(positionToBody(data));
			},
			text() {
				return queryText(data[0]);
			},
			attr: function (key?: string) {
				if (isString(key)) {
					return queryAttr(data[0], key);
				}
				return queryAttrs(data[0]);
			} as Query['attr'],
			class() {
				return queryClass(data[0], false);
			},
			classList() {
				return queryClass(data[0], true);
			},
			id() {
				return queryAttr(data[0], 'id');
			},
			style: function (styleName?: string) {
				if (isString(styleName)) {
					styleName = splitByUpper(styleName).join('-');
					return queryStyle(data[0], styleName);
				}
				return queryStyle(data[0]);
			} as Query['style'],
			dataset: function (name?: string) {
				if (isString(name)) {
					return queryDataset(data[0], name);
				}
				return queryDataset(data[0]);
			} as Query['dataset'],
		};
	}
	return _query(data);
}
