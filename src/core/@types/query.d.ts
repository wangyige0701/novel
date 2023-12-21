import { Combinators } from './data/combinator';

export type AttributeData = {
	key: string;
	value: string;
};

export type SelectorInfo =
	| {
			type: 'id' | 'class';
			name: string[];
	  }
	| {
			type: 'tag';
			name: string;
	  };

export type MatchResult = {
	/** 组合器 */
	combinator?: Combinators;
	selector: SelectorInfo[];
	attributes?: AttributeData[];
};

/**
 * 选择器匹配数据时，如果匹配到生成的匹配对象
 */
export type SelectPosition = {
	parent: HTMLParse[];
	target: HTMLParseTag;
	index: number;
};
