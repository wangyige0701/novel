export type HTMLParseText = {
	type: 'text';
	text: string;
	start: number;
	end: number;
};

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

export type HTMLParseTag = HTMLParseTagCommon & {
	type: 'tag';
};

export type HTMLParseScript = HTMLParseTagCommon & {
	type: 'script';
	script: 'js' | 'css';
};

export type HTMLParse = HTMLParseText | HTMLParseTag | HTMLParseScript;
