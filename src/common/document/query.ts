import type {
	SelectPosition,
	SelectorInfo,
	HTMLParse,
	HTMLParseText,
	Query,
	QueryResult,
	MatchResult,
	ExplorerItem,
	HTMLSelectorParse,
	MatchResultList,
} from '@/@types/common/document';
import {
	firstLowerCase,
	firstUpperCase,
	Fn,
	isArray,
	isString,
	isUndef,
	lowerCase,
	splitByUpper,
} from '@wang-yige/utils';
import { Combiner } from './combiner';
import { handleSelector } from './selector';
import { matchAllStyles } from './match';

/**
 * 遍历 html 语法树，根据选择器获取对象，广度优先遍历时，每个单元都和选择器第一位进行匹配，
 * 匹配上则进行记录，后续每个单元都会遍历记录数组，根据下一个选择器状态进行匹配。
 */
class Explorer {
	/** 选择器解析对象数组，左右反转，先匹配最后一个选择器 */
	private selector: MatchResultList[];
	/** 是否获取所有匹配元素 */
	private all: boolean;
	/** 解析结果记录 */
	private record: ExplorerItem[] = [];

	constructor(ast: HTMLParse[], selector: string, all: boolean) {
		this.all = all;
		this.selector = handleSelector(selector);
		for (const [index, selector] of this.selector.entries()) {
			// 组合器前移
			selector.combiner = this.selector[index + 1]?.combiner;
		}
		this.selector = this.selector.reverse();
		for (const [index, selector] of this.selector.entries()) {
			selector.next = this.selector[index + 1];
		}
		if (this.selector.length) {
			// 开始匹配
			if (this.traversal(ast) === true) {
				// 为 true 表示匹配已经完成
				return;
			}
			if (this.selector.length === 1) {
				return;
			}
			// 逆推筛选
			for (const item of [...this.record]) {
				this.match(item);
			}
		}
	}

	/**
	 * 遍历树，深度优先遍历，先把选择器最后一位匹配上，筛选所有结果后再逆推匹配结果
	 */
	private traversal(ast: HTMLParse[]) {
		// 不同父元素节点分开遍历，兄弟组合器匹配必须在同一个父节点下
		for (const item of ast) {
			if (item.type === 'text') {
				continue;
			}
			if (handleSelectorMatched(item, this.selector[0].selector)) {
				const index = this.collect(item);
				// 获取单个元素时，收集完成需要直接判断是否匹配
				if (!this.all) {
					if (this.match(this.record[index])) {
						return true;
					} else {
						this.record.splice(index, 1);
					}
				}
			}
			if (item.children.length) {
				this.traversal(item.children);
			}
		}
	}

	/**
	 * 首次收集所有最后一位选择器匹配元素，直接逆推
	 */
	private collect(item: HTMLSelectorParse) {
		const selector = this.selector[0];
		const index = this.record.push({
			current: item,
			selector: selector.next,
		});
		return index - 1;
	}

	/**
	 * 匹配失败后移除记录数据
	 */
	private failed(target: ExplorerItem) {
		const index = this.record.indexOf(target);
		if (index !== -1) {
			this.record.splice(index, 1);
		}
	}

	/**
	 * 遍历记录数组匹配结果
	 */
	private match(item: ExplorerItem) {
		const { current, selector } = item;
		if (handleCombiner(current, selector)) {
			return true;
		}
		this.failed(item);
	}

	/**
	 * 获取结果
	 */
	public get result() {
		return this.record.map(item => ({ target: item.current }));
	}
}

function handleCombiner(item: HTMLSelectorParse | undefined, match: MatchResultList | undefined) {
	if (!match) {
		// 传入 undefined ，表示已成功匹配到最后，状态为成功
		return true;
	} else if (!item) {
		// 有下一个选择器，但是没有节点数据，则状态为失败
		return false;
	}
	const { combiner, selector } = match;
	if (combiner === Combiner.CHILD) {
		if (handleSelectorMatched(item.parent, selector) && handleCombiner(item.parent, match.next)) {
			return true;
		}
		return false;
	}
	if (combiner === Combiner.DESCENDANT) {
		let parent = item.parent;
		while (parent) {
			if (handleSelectorMatched(parent, selector) && handleCombiner(parent, match.next)) {
				return true;
			}
			parent = parent.parent;
		}
		return false;
	}
	// 兄弟元素判断
	const siblings = item.parent?.children || [];
	if (siblings.length < 2) {
		return false;
	}
	if (!siblings.includes(item)) {
		return false;
	}
	const customIndex = siblings.indexOf(item);
	if (customIndex === siblings.length - 1) {
		return false;
	}
	if (combiner === Combiner.NEXT_SIBLING) {
		const target = siblings[customIndex + 1];
		if (target.type === 'text') {
			return false;
		}
		if (handleSelectorMatched(target, selector) && handleCombiner(target, match.next)) {
			return true;
		}
		return false;
	}
	if (combiner === Combiner.SUBSEQUENT_SIBLING) {
		for (let i = customIndex + 1; i < siblings.length; i++) {
			const target = siblings[i];
			if (target.type === 'text') {
				return false;
			}
			if (handleSelectorMatched(target, selector) && handleCombiner(target, match.next)) {
				return true;
			}
		}
		return false;
	}
	return false;
}

/**
 * 通过选择器进行校验
 */
function handleSelectorMatched(matchTarget: HTMLSelectorParse | undefined, selectors: SelectorInfo[]) {
	if (!matchTarget) {
		return false;
	}
	for (const selector of selectors) {
		if (!handleSelectorType(matchTarget, selector)) {
			return false;
		}
	}
	return true;
}

/**
 * 校验单个选择器
 */
function handleSelectorType(matchTarget: HTMLSelectorParse, selector: SelectorInfo) {
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
 * 匹配选择器
 * @param data html 解析语法树
 * @param selector 选择器字符串
 * @param all 是否返回所有匹配结果
 */
function select(data: HTMLParse[], selectorStr: string, all: boolean): SelectPosition[] {
	return new Explorer(data, selectorStr, all).result;
}

/**
 * 获取当前元素的文本数据
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

/**
 * 获取类名数据
 * @param list 为 true 返回类名数组，否则返回字符串
 */
function queryClass(data: HTMLParse | undefined, list: true): string[];
function queryClass(data: HTMLParse | undefined, list: boolean): string;
function queryClass(data: HTMLParse | undefined, list: boolean) {
	const result = queryAttr(data, 'class');
	if (list) {
		return result.split(/\s+/);
	}
	return result;
}

/**
 * 获取样式数据
 */
function queryStyle(data: HTMLParse | undefined): Record<string, string>;
function queryStyle(data: HTMLParse | undefined, name: string): string;
function queryStyle(data: HTMLParse | undefined, name?: string) {
	const result = queryAttr(data, 'style');
	const styles = {} as Record<string, string>;
	for (const item of result.matchAll(matchAllStyles)) {
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

/**
 * 获取 data- 开头的属性
 */
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
 * 创建查询结果对象
 */
function queryResult(target: SelectPosition | undefined): QueryResult {
	const result: QueryResult = Object.create(query(target ? target.target : ({} as HTMLParse)));
	result.target = target?.target;
	result.parent = result.target?.parent;
	result.children = result.target?.children || [];
	return result;
}

/**
 * 通过解析树进行元素查找，每次只查找一个元素
 */
export function query(data: HTMLParse[] | HTMLParse): Query {
	if (!isArray(data)) {
		data = [data];
	}
	return {
		$(selector: string) {
			return queryResult(select(data, selector, false)[0]);
		},
		$$(selector: string) {
			const target = select(data, selector, true);
			return target.map(queryResult);
		},
		body() {
			return queryResult(select(data, 'body', false)[0]);
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
				styleName = splitByUpper(styleName).map(lowerCase).join('-');
				return queryStyle(data[0], styleName);
			}
			return queryStyle(data[0]);
		} as Query['style'],
		dataset: function (name?: string) {
			if (isString(name)) {
				name = firstLowerCase(name.split('-').map(firstUpperCase).join(''));
				return queryDataset(data[0], name);
			}
			return queryDataset(data[0]);
		} as Query['dataset'],
	} satisfies Query;
}
