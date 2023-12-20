type HTMLParseText = {
	type: 'text';
	text: string;
	start: number;
	end: number;
};

type HTMLParseTagCommon = {
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

type HTMLParseTag = HTMLParseTagCommon & {
	type: 'tag';
};

type HTMLParseScript = HTMLParseTagCommon & {
	type: 'script';
	script: 'js' | 'css';
};

type HTMLParse = HTMLParseText | HTMLParseTag | HTMLParseScript;
