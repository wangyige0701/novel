import { regexpMatchWithNoAdvance } from '@/utils/regexp';
import { AttributeData, MatchResult } from '../@types/query';
import { Combinators } from './combinator';
import { getAttributeDatas, getDataInQuote, nameMatch, split } from './match';

/** 组合器类型映射 */
const combinatorTypes: { [key: string]: Combinators } = {
	'>': Combinators.CHILD,
	'+': Combinators.NEXT_SIBLING,
	'~': Combinators.SUBSEQUENT_SIBLING,
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
		const [$, key, value] = attr;
		const matchResult = value.match(getDataInQuote);
		if (!matchResult) {
			continue;
		}
		const [$$, doubleQuote, singleQuote, fullValue] = matchResult;
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
			data.selector.push({
				type: typeVal,
				name: [selectorVal],
			});
		} else {
			innerData.name.push(selectorVal);
		}
		if (!!attrs) {
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
		let combinators = (item[1] || '').trim();
		let matchName = item[2].trim();
		const localData: MatchResult = {
			...(result.length > 0
				? {
						combinators:
							combinators in combinatorTypes ? combinatorTypes[combinators] : Combinators.DESCENDANT,
					}
				: {}),
			selector: [],
		};
		handleSelectorType(matchName, localData);
		if (localData.selector.length === 0) {
			continue;
		}
		result.push(localData);
	}
	return result;
}
