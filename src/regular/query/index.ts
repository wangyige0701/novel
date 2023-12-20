import { SelectPosition, SelectorInfo } from '../@types/query';
import { Combinators } from './combinator';
import { handleSelector } from './selector';

type TravselCalback = (tag: HTMLParseTag, index: number, parent: HTMLParse[]) => boolean;

/**
 * 遍历树
 * @param deep
 * @param d
 * @param callback
 * @param parent
 * @returns
 */
function _traversal(
	deep: boolean,
	d: HTMLParse[],
	callback: TravselCalback,
	parent?: HTMLParse[],
): undefined | SelectPosition {
	const queue: HTMLParseTag[] = [];
	let index = 0; // 只在tag处自增
	for (const item of d) {
		if (item.type === 'tag') {
			const parentVal = parent ? parent : d;
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
	while (queue.length > 0) {
		const item = queue.shift();
		if (item && item.children && item.children.length > 0) {
			// 遍历子元素，传入当前元素作为父元素
			const result = _traversal(deep, item.children, callback, item.children);
			if (result) {
				return result;
			}
		}
	}
	return;
}

/**
 * 遍历树获取所有匹配对象
 * @param d
 * @param callback
 * @returns
 */
function _traversal_all(deep: boolean, d: HTMLParse[], callback: TravselCalback): SelectPosition[] {
	const result: SelectPosition[] = [];
	_traversal(true, d, (tag, index, parent) => {
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
 * @param d
 * @param callback
 * @param all 是否匹配树内所有满足条件的数据
 * @returns 返回匹配到的元素及其索引，以及父元素
 */
function _deep(d: HTMLParse[], callback: TravselCalback, all: true): SelectPosition[];
function _deep(d: HTMLParse[], callback: TravselCalback, all?: false): SelectPosition | undefined;
function _deep(d: HTMLParse[], callback: TravselCalback, all: boolean = false) {
	if (all) {
		return _traversal_all(true, d, callback);
	}
	return _traversal(true, d, callback);
}

/**
 * 不进行深度递归，只在第一层检测
 * @param d
 * @param callback
 * @returns
 */
function _shallow(d: HTMLParse[], callback: TravselCalback, all: true): SelectPosition[];
function _shallow(d: HTMLParse[], callback: TravselCalback, all?: false): SelectPosition | undefined;
function _shallow(d: HTMLParse[], callback: TravselCalback, all: boolean = false) {
	if (all) {
		return _traversal_all(false, d, callback);
	}
	return _traversal(false, d, callback);
}

/**
 * 校验单个选择器
 * @param matchTarget
 * @param selector
 * @returns
 */
function handleSelectorType(matchTarget: HTMLParseTag, selector: SelectorInfo) {
	if (selector.type === 'tag') {
		return matchTarget.tag === selector.name;
	}
	const attrs = matchTarget.attrs.find(item => item.name === selector.type);
	if (!attrs) {
		return false;
	}
	const attrsValue = attrs.value.split(' ').filter(Boolean);
	const toCheckNames = [...new Set(selector.name)];
	for (const name of toCheckNames) {
		if (!attrsValue.includes(name)) {
			return false;
		}
	}
	return true;
}

/**
 * 通过选择器进行校验
 * @param matchTarget
 * @param selectors
 * @returns
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
	combinator: Combinators,
	selector: SelectorInfo[],
	target: HTMLParseTag,
	index: number,
	parent: HTMLParse[],
	all: true,
): SelectPosition[];
function handleCombinators(
	combinator: Combinators,
	selector: SelectorInfo[],
	target: HTMLParseTag,
	index: number,
	parent: HTMLParse[],
	all?: false,
): undefined | SelectPosition;
function handleCombinators(
	combinator: Combinators,
	selector: SelectorInfo[],
	target: HTMLParseTag,
	index: number,
	parent: HTMLParse[],
	all: boolean = false,
) {
	let useFunc: typeof _deep | typeof _shallow = _shallow;
	let params: [HTMLParse[], TravselCalback] | undefined = void 0;
	if (combinator === Combinators.DESCENDANT) {
		// 后代
		params = [target.children, tag => handleSelectorMatched(tag, selector)];
		useFunc = _deep;
	} else if (combinator === Combinators.CHILD) {
		// 子元素
		params = [target.children, tag => handleSelectorMatched(tag, selector)];
	} else if (combinator === Combinators.NEXT_SIBLING) {
		// 接续兄弟
		params = [parent, (tag, i) => i === index + 1 && handleSelectorMatched(tag, selector)];
	} else if (combinator === Combinators.SUBSEQUENT_SIBLING) {
		// 后代兄弟
		params = [parent, (tag, i) => i >= index && handleSelectorMatched(tag, selector)];
	}
	if (params) {
		return all ? useFunc(...params, true) : useFunc(...params, false);
	}
	return;
}

/**
 * 匹配选择器
 * @param data
 * @param selector
 */
function select(data: HTMLParse[], selectorStr: string, all: true): SelectPosition[];
function select(data: HTMLParse[], selectorStr: string, all?: false): SelectPosition | undefined;
function select(data: HTMLParse[], selectorStr: string, all: boolean = false) {
	const parseResult = handleSelector(selectorStr);
	let matchSuccess: SelectPosition | SelectPosition[] | undefined = void 0;
	for (const parse of parseResult) {
		const { combinator, selector } = parse;
		if (!combinator) {
			// 开始
			const target = all
				? _deep(data, tag => handleSelectorMatched(tag, selector), true)
				: _deep(data, tag => handleSelectorMatched(tag, selector));
			if (target) {
				matchSuccess = target;
			} else {
				return;
			}
			continue;
		}
		if (!matchSuccess) {
			return;
		}
		if (Array.isArray(matchSuccess)) {
			let result: SelectPosition[] = [];
			for (const matchItem of matchSuccess) {
				result.push(
					...handleCombinators(
						combinator,
						selector,
						matchItem.target,
						matchItem.index,
						matchItem.parent,
						true,
					),
				);
			}
			matchSuccess = result;
			continue;
		}
		matchSuccess = handleCombinators(
			combinator,
			selector,
			matchSuccess.target,
			matchSuccess.index,
			matchSuccess.parent,
		);
	}
	return matchSuccess;
}

/**
 * 将html解析树定位到body位置，并且如果有值则返回一个被数组包裹着的对象
 * @param data
 * @returns
 */
export function positionToBody(data: HTMLParse[]): HTMLParse[] {
	const result = _deep(data, tag => tag.tag === 'body');
	return result ? [result.target] : [];
}

/**
 * 通过解析树进行元素查找，每次只查找一个元素
 */
export function query(data: HTMLParse[]) {
	return {
		/**
		 * 匹配单个元素
		 * @param selector 选择器字符
		 * @returns
		 */
		$: function (selector: string) {
			return select(data, selector)?.target;
		},
		/**
		 * 匹配所有元素
		 * @param selector 选择器字符
		 * @returns
		 */
		$all: function (selector: string) {
			return select(data, selector, true)
				.map(item => {
					return item.target;
				})
				.filter(Boolean);
		},
	};
}
