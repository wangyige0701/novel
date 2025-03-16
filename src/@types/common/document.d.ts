import type { Combiner } from '@/common/document/combiner';

// 解析

/**
 * 标签解析属性
 */
export type HTMLParseTagCommon = {
	tag: string;
	lowerCasedTag: string;
	attrs: {
		name: string;
		value: string;
	}[];
	start: number;
	end: number;
	startTagIndex: number;
	endTagIndex: number;
	parent?: HTMLParseTag | HTMLParseScript;
	children: Array<HTMLParse>;
};

export type HTMLParseText = {
	type: 'text';
	text: string;
	start: number;
	end: number;
};

export type HTMLParseTag = {
	type: 'tag';
} & HTMLParseTagCommon;

export type HTMLParseScript = {
	type: 'script';
	script: 'js' | 'css';
} & HTMLParseTagCommon;

/** 解析后有三种类型，文本、标签、脚本 */
export type HTMLParse = HTMLParseText | HTMLParseTag | HTMLParseScript;

/** 选择器可以匹配的 html 元素 */
export type HTMLSelectorParse = HTMLParseTag | HTMLParseScript;

// 查询

export type AttributeData = {
	key: string;
	value: string;
};

/**
 * 选择器解析数据
 */
export type SelectorInfo =
	| {
			type: 'class';
			data: string[];
	  }
	| {
			type: 'tag';
			data: string;
	  }
	| {
			type: 'id';
			data: string;
	  }
	| {
			type: 'attr';
			data: AttributeData[];
	  };

export type SelectorMap = {
	class: string[];
	tag: string;
	id: string;
	attr: AttributeData[];
};

export type MatchResult = {
	/** 组合器 */
	combiner?: Combiner;
	selector: SelectorInfo[];
};

export type HTMLParent = HTMLParseTag | HTMLParseScript;

type HTMLTarget = HTMLParent;

/**
 * 递归时记录选择器节点信息
 */
export type SelectPosition = {
	target: HTMLParent;
	index: number;
};

export type QueryResult = Query & {
	parent?: HTMLParent;
	target?: HTMLTarget;
	children: HTMLParse[];
	index: number;
};

export interface Query {
	/**
	 * 匹配单个元素
	 * @param selector 选择器字符
	 */
	$(selector: string): QueryResult;
	/**
	 * 匹配所有元素
	 * @param selector 选择器字符
	 */
	$$(selector: string): QueryResult[];
	/**
	 * 从 body 位置开始匹配
	 */
	body(): Query;
	/**
	 * 获取当前元素文本信息，如果传入数组，则获取第一个
	 */
	text(): string;
	/**
	 * 获取全部元素属性
	 */
	attr(): HTMLParseTagCommon['attrs'];
	/**
	 * 根据键值获取指定属性值
	 */
	attr(key: string): string;
	/**
	 * 获取元素的类名字符串
	 */
	class(): string;
	/**
	 * 获取元素的类名数组
	 */
	classList(): string[];
	/**
	 * 获取元素的 id
	 */
	id(): string;
	/**
	 * 获取所有样式的对象
	 */
	style(): Record<string, string>;
	/**
	 * 根据样式名获取样式值，样式名支持传入驼峰以及短横线两种形式
	 */
	style(styleName: string): string;
	/**
	 * 获取所有的自定义数据属性对象，有短横线的属性名会转为驼峰格式
	 */
	dataset(): Record<string, string>;
	/**
	 * 根据属性名获取自定义数据属性值，支持驼峰以及短横线两种形式
	 */
	dataset(name: string): string;
}

/**
 * 解析单元
 */
export type ExplorerItem = {
	/**
	 * 当前匹配对象
	 */
	current: HTMLSelectorParse;
	/**
	 * 当前层级
	 */
	currentLayer: number;
	/**
	 * 下一次匹配时对应的层级，为 -1 则表示后代选择器，即只要大于当前层级即可
	 */
	nextLayer: number;
	/**
	 * 下一次匹配的选择器索引
	 */
	nextSelectorIndex: number;
	/**
	 * 在同一层级下的位置
	 */
	layerPosition: number;
	/**
	 * 匹配是否结束
	 */
	isEnd: boolean;
};
