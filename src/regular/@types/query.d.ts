import { Combinators } from './data/combinator';

type SelectorTypes = 'id' | 'class' | 'tag';

export type AttributeData = {
	key: string;
	value: string;
};

export type SelectorInfo = {
	type: SelectorTypes;
	name: string[];
};

export type MatchResult = {
	/** 组合器 */
	combinators?: Combinators;
	selector: SelectorInfo[];
	attributes?: AttributeData[];
};

type SeelctorSplitItem = {};
