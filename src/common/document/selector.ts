import type { AttributeData, MatchResult, SelectorInfo, SelectorMap } from '@/@types/common/document';
import { parseAttr, matchAttr, matchClass, matchId, matchTag, splitSelector } from './match';
import { Combiner } from './combiner';

/**
 * 通过exec遍历匹配，防止断言语句造成索引错位，正则中有断言时使用
 * @param regexp
 * @param str
 * @returns
 */
function useExec(regexp: RegExp, str: string) {
	const result: RegExpExecArray[] = [];
	let match: RegExpExecArray | null;
	regexp.lastIndex = 0;
	while ((match = regexp.exec(str)) !== null) {
		result.push(match);
		str = str.substring(regexp.lastIndex);
		regexp.lastIndex = 0;
	}
	return result;
}

/** 组合器类型映射 */
const combinerTypes: { [key: string]: Combiner } = {
	'>': Combiner.CHILD,
	'+': Combiner.NEXT_SIBLING,
	'~': Combiner.SUBSEQUENT_SIBLING,
};

/**
 * 处理属性数据
 * @param attribute
 * @returns
 */
function handleSelectorAttribute(attribute: string) {
	const attr = attribute.match(parseAttr);
	if (!attr) {
		return;
	}
	if (!attr.groups) {
		return;
	}
	const { name, double, single, full } = attr.groups;
	if (!name) {
		return;
	}
	const value = double || single || full || '';
	return {
		key: name,
		value,
	} as AttributeData;
}

/**
 * 判断选择器的类型并且归类
 * @param selector 选择器
 * @param data 数据收集对象
 */
function handleSelectorType(selector: string, data: MatchResult) {
	let value = selector.trim();
	function advance(n: number) {
		value = value.substring(n).trimStart();
	}
	function find<T extends SelectorInfo['type']>(
		data: SelectorInfo[],
		type: T,
	): { type: T; data: SelectorMap[T] } | undefined {
		return data.find(item => item.type === type) as { type: T; data: SelectorMap[T] } | undefined;
	}
	while (value) {
		const match =
			value.match(matchClass) || value.match(matchId) || value.match(matchTag) || value.match(matchAttr);
		if (!match || !match[0] || !match.groups) {
			break;
		}
		const index = match.index || 0;
		const { cls, id, tag, attr } = match.groups;
		if (cls) {
			const target = find(data.selector, 'class');
			if (!target) {
				data.selector.push({ type: 'class', data: [cls] });
			} else {
				target.data.push(cls);
			}
		} else if (id) {
			const target = find(data.selector, 'id');
			if (target) {
				data.selector.length = 0;
				break;
			}
			data.selector.push({ type: 'id', data: id });
		} else if (tag) {
			const target = find(data.selector, 'tag');
			if (target) {
				data.selector.length = 0;
				break;
			}
			data.selector.push({ type: 'tag', data: tag });
		} else if (attr) {
			const target = find(data.selector, 'attr');
			// 解析属性
			const attrTarget = handleSelectorAttribute(attr);
			if (attrTarget) {
				if (!target) {
					data.selector.push({ type: 'attr', data: [attrTarget] });
				} else {
					target.data.push(attrTarget);
				}
			}
		} else {
			break;
		}
		advance(index + match[0].length);
	}
}

/**
 * 选择器处理函数
 * @example
 * ```css
 * #id[attr=1].class[attr=2]img.class[attr=3]
 * ```
 * 代表
 * ```html
 * <div id="id" class="class" attr="1 2">
 * 	<img class="class" attr="3" />
 * </div>
 * ```
 */
export function handleSelector(selector: string): MatchResult[] {
	// 第二项是组合器，第三项是选择器
	const matchs = useExec(splitSelector, selector);
	const result: MatchResult[] = [];
	for (const match of matchs) {
		if (!match.groups) {
			continue;
		}
		const group = match.groups!;
		// 选择器
		const pickSelector = group.selector;
		if (!pickSelector) {
			continue;
		}
		// 组合器
		const combiner = (group.combiner || '').trim();
		const localData = {
			selector: [],
		} as MatchResult;
		if (result.length) {
			// 第一个元素不需要组合器
			if (combiner in combinerTypes) {
				localData.combiner = combinerTypes[combiner];
			} else {
				localData.combiner = Combiner.DESCENDANT;
			}
		}
		// 解析选择器
		handleSelectorType(pickSelector, localData);
		if (!localData.selector.length) {
			continue;
		}
		result.push(localData);
	}
	return result;
}
