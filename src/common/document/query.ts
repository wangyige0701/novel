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
} from '@/@types/common/document';
import { firstLowerCase, firstUpperCase, isArray, isString, isUndef, lowerCase, splitByUpper } from '@wang-yige/utils';
import { Combiner } from './combiner';
import { handleSelector } from './selector';
import { matchAllStyles } from './match';

/**
 * 遍历 html 语法树，根据选择器获取对象，广度优先遍历时，每个单元都和选择器第一位进行匹配，
 * 匹配上则进行记录，后续每个单元都会遍历记录数组，根据下一个选择器状态进行匹配。
 */
class Explorer {
	/** 解析的层级 */
	private layer = 0;
	/** 当前正在遍历的语法树节点对象 */
	private ast: HTMLParse[] = [];
	/** 选择器解析对象数组 */
	private selector: MatchResult[];
	/** 是否获取所有匹配元素 */
	private all: boolean;
	/** 解析结果记录 */
	private record: ExplorerItem[] = [];
	/** 实际遍历的记录数组，减少时间复杂度 */
	private traversalRecord: ExplorerItem[] = [];

	constructor(ast: HTMLParse[], selector: string, all: boolean) {
		this.all = all;
		this.selector = handleSelector(selector);
		if (this.selector.length) {
			// 开始匹配
			this.traversal(ast, 0);
		}
	}

	/**
	 * 遍历树，深度优先遍历，js 查询器也是深度优先遍历
	 */
	private traversal(ast: HTMLParse[], layer: number) {
		// 不同父元素节点分开遍历，兄弟组合器匹配必须在同一个父节点下
		let index = 0;
		for (const item of ast) {
			this.ast = ast;
			this.layer = layer;
			const _index = index++;
			if (item.type === 'text') {
				continue;
			}
			if (this.match(item, _index) === true) {
				return true;
			}
			if (item.children.length) {
				if (this.traversal(item.children, layer + 1) === true) {
					return true;
				}
			}
			for (const record of this.traversalRecord) {
				if (record.isEnd) {
					continue;
				}
				// TODO
				if (record.nextLayer === record.currentLayer) {
					if (record.currentLayer > layer || (record.currentLayer === layer && _index === ast.length - 1)) {
						// 【匹配失败】当前节点遍历完成，为兄弟组合器且同层级，并且是最后一个元素；或者大于当前层级
						this.failed(record);
						continue;
					}
				}
				if (record.currentLayer >= layer) {
					// 【匹配失败】当前节点遍历完成后，匹配未结束且层级大于等于当前层级
					this.failed(record);
				}
			}
		}
	}

	/**
	 * 根据组合器获取下一层级
	 */
	private nextLayer(combiner?: Combiner) {
		if (isUndef(combiner)) {
			// 空值表示没有后续选择器，直接返回 -1，并且此处 -1 不会影响后续解析
			return -1;
		}
		if (combiner === Combiner.NEXT_SIBLING || combiner === Combiner.SUBSEQUENT_SIBLING) {
			return this.layer;
		}
		if (combiner === Combiner.CHILD) {
			return this.layer + 1;
		}
		return -1;
	}

	/**
	 * 匹配成功后重置记录数据，如果选择器索引是最后一位，则将 isEnd 置为 true
	 */
	private success(item: HTMLSelectorParse, selectorIndex: number, index: number, target?: ExplorerItem) {
		const nextMatch = this.selector[selectorIndex + 1];
		const _target: ExplorerItem = {
			current: item,
			currentLayer: this.layer,
			nextLayer: this.nextLayer(nextMatch?.combiner),
			nextSelectorIndex: selectorIndex + 1,
			layerPosition: index,
			isEnd: selectorIndex === this.selector.length - 1,
		};
		if (!target) {
			this.record.push(_target);
			if (!_target.isEnd) {
				this.traversalRecord.push(_target);
			}
		} else {
			for (const key in _target) {
				(target as any)[key] = _target[key as keyof ExplorerItem];
			}
			if (target.isEnd) {
				this.traversalRecord.splice(this.traversalRecord.indexOf(target), 1);
			}
		}
		return _target.isEnd;
	}

	/**
	 * 匹配失败后移除记录数据
	 */
	private failed(target: ExplorerItem) {
		const index = this.record.indexOf(target);
		if (index !== -1) {
			this.record.splice(index, 1);
		}
		const index2 = this.traversalRecord.indexOf(target);
		if (index2 !== -1) {
			this.traversalRecord.splice(index2, 1);
		}
	}

	/**
	 * 对两个记录数组都插入一条克隆数据
	 */
	private clone(target: ExplorerItem, clone: ExplorerItem) {
		this.record.splice(this.record.indexOf(target) + 1, 0, clone);
		this.traversalRecord.splice(this.traversalRecord.indexOf(target) + 1, 0, clone);
	}

	/**
	 * 遍历记录数组依次进行匹配
	 */
	private match(item: HTMLSelectorParse, index: number) {
		// 全匹配时，某条记录匹配成功后，克隆一份，继续后续匹配
		const clones: Array<{ target: ExplorerItem; clone: ExplorerItem }> = [];
		// 只遍历未完成的记录
		for (const record of [...this.traversalRecord]) {
			if (!this.traversalRecord.includes(record) || record.isEnd) {
				continue;
			}
			if (record.nextLayer === -1) {
				if (this.layer <= record.currentLayer) {
					// 【不触发匹配】-1 代表后代选择器的层级，当前层级必须大于上一次选择器匹配的层级
					continue;
				}
			} else if (record.nextLayer !== this.layer) {
				// 【不触发匹配】其余选择器必须完全等于当前层级才算匹配成功
				continue;
			}
			const selector = this.selector[record.nextSelectorIndex];
			const isSameParent = item.parent === record.current;
			if (selector.combiner === Combiner.NEXT_SIBLING) {
				// 【匹配失败】接续兄弟组合器，位置需要紧跟在前一个元素之后
				if (isSameParent && index > record.layerPosition + 1) {
					this.failed(record);
					continue;
				}
			}
			const isLastChild = index === this.ast.length - 1;
			if (!handleSelectorMatched(item, selector.selector)) {
				/** 是否是当前遍历节点字节点的最后一位 */
				if (isLastChild && isSameParent && selector.combiner === Combiner.SUBSEQUENT_SIBLING) {
					// 【匹配失败】一般兄弟组合器，父节点最后一位还没有匹配上，则匹配失败
					this.failed(record);
				}
				continue;
			}
			// 如果下一个组合器是兄弟元素，则需要判断当前元素是否是父节点下最后一位，是的话需要删除当前记录，因为后续一定不会成功匹配
			const nextSeelctor = this.selector[record.nextSelectorIndex + 1];
			if (nextSeelctor) {
				const { combiner } = nextSeelctor;
				if (combiner === Combiner.NEXT_SIBLING || combiner === Combiner.SUBSEQUENT_SIBLING) {
					if (isLastChild) {
						// 【匹配失败】父节点最后一位匹配成功，但是下一个组合器是兄弟元素，则删除当前记录
						this.failed(record);
						continue;
					}
				}
			}
			clones.push({ target: record, clone: { ...record } });
			if (this.success(item, record.nextSelectorIndex, index, record) && !this.all) {
				return true;
			}
		}
		if (this.all && clones.length) {
			for (const { target, clone } of clones) {
				// 插入克隆数据
				this.clone(target, clone);
			}
		}
		const firstSelector = this.selector[0];
		if (handleSelectorMatched(item, firstSelector.selector)) {
			if (this.success(item, 0, index) && !this.all) {
				// 只查询一个元素时，如果首位匹配上，则直接返回
				return true;
			}
		}
	}

	/**
	 * 获取结果
	 */
	public get result() {
		return this.record.filter(item => item.isEnd).map(item => ({ target: item.current, index: item.currentLayer }));
	}
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
 * 通过选择器进行校验
 */
function handleSelectorMatched(matchTarget: HTMLSelectorParse, selectors: SelectorInfo[]) {
	for (const selector of selectors) {
		if (!handleSelectorType(matchTarget, selector)) {
			return false;
		}
	}
	return true;
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
	result.index = target?.index ?? -1;
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
