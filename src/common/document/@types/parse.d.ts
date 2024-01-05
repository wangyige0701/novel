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
	children: HTMLParse[];
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

export type HTMLParse = HTMLParseText | HTMLParseTag | HTMLParseScript;
