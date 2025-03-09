import type { AttributeData, MatchResult, SelectorInfo } from '@/@types/common/document';
import { getAttributeDatas, getDataInQuote, nameMatch, split } from './match';
import { Combiner } from './combiner';

/**
 * 通过exec遍历匹配，防止断言语句造成索引错位，正则中有断言时使用
 * @param regexp
 * @param str
 * @returns
 */
function regexpMatchWithNoAdvance(regexp: RegExp, str: string) {
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
	getAttributeDatas.lastIndex = 0;
	const result: AttributeData[] = [];
	const allAttrs = [...attribute.matchAll(getAttributeDatas)];
	for (const attr of allAttrs) {
		const [_$, key, value] = attr;
		const matchResult = value.match(getDataInQuote);
		if (!matchResult) {
			continue;
		}
		const [_$$, doubleQuote, singleQuote, fullValue] = matchResult;
		const validValue = doubleQuote || singleQuote || fullValue;
		if (!validValue) {
			continue;
		}
		result.push({
			key,
			value: validValue,
		});
	}
	return result;
}

/**
 * 判断选择器的类型并且归类
 * @param names
 */
function handleSelectorType(matchName: string, data: MatchResult) {
	nameMatch.lastIndex = 0;
	const names = [...matchName.matchAll(nameMatch)];
	for (const name of names) {
		if (!name.groups) {
			continue;
		}
		const { idVal, classVal, tagVal, attrs } = name.groups;
		const [isId, isClass, isTag] = [!!idVal, !!classVal, !!tagVal];
		if (!(+isId ^ +isClass ^ +isTag)) {
			// 全部都是false的情况
			continue;
		}
		const typeVal = isId ? 'id' : isClass ? 'class' : 'tag';
		const selectorVal = idVal || classVal || tagVal;
		const innerData = data.selector.find(item => item.type === typeVal);
		if (!innerData) {
			const item: SelectorInfo =
				typeVal === 'tag'
					? {
							type: typeVal,
							name: selectorVal,
						}
					: {
							type: typeVal,
							name: [selectorVal],
						};
			data.selector.push(item);
		} else {
			if (innerData.type === 'tag') {
				innerData.name = selectorVal;
			} else {
				innerData.name.push(selectorVal);
			}
		}
		if (attrs) {
			// 属性判断
			const attrDatas = handleSelectorAttribute(attrs);
			if (attrDatas.length === 0) {
				continue;
			}
			if (Array.isArray(data.attributes)) {
				data.attributes.push(...attrDatas);
			} else {
				data.attributes = attrDatas;
			}
		}
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
	const selectorSplit = regexpMatchWithNoAdvance(split, selector);
	const result: MatchResult[] = [];
	for (const item of selectorSplit) {
		if (item.length === 0) {
			continue;
		}
		// 组合器
		const combiner = (item[1] || '').trim();
		const matchName = item[2].trim();
		const localData = {
			...(result.length > 0
				? {
						combiner: combiner in combinerTypes ? combinerTypes[combiner] : Combiner.DESCENDANT,
					}
				: {}),
			selector: [],
		} satisfies MatchResult;
		handleSelectorType(matchName, localData);
		if (localData.selector.length === 0) {
			continue;
		}
		result.push(localData);
	}
	return result;
}
