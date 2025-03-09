import type { HTMLParse, HTMLParseScript, HTMLParseTag, HTMLParseText } from '@/@types/common/document';
import { isBoolean } from '@wang-yige/utils';

type Freeze<O extends object, B extends boolean> = B extends true ? Readonly<O> : O;

function toFreeze<T extends object, F extends boolean>(o: T, isFreeze: F): Freeze<T, F> {
	if (!isFreeze) {
		return o;
	}
	return Object.freeze(o);
}

function makeMap(str: string, expectsLowerCase?: boolean): (key: string) => true | void {
	const map = Object.create(null);
	const list: Array<string> = str.split(',');
	for (let i = 0; i < list.length; i++) {
		map[list[i]] = true;
	}
	return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val];
}

const isNonPhrasingTag = makeMap(
	'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
		'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
		'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
		'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
		'title,tr,track',
);

const canBeLeftOpenTag = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source');

const isUnaryTag = makeMap(
	'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' + 'link,meta,param,source,track,wbr',
);

const unicodeRegExp =
	/a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const dynamicArgAttribute =
	/^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);
const startTagClose = /^\s*(\/?)>/;
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
const doctype = /^<!DOCTYPE [^>]+>/i;
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/;
const conditionalComment = /^<!\[/;

// Special Elements (can contain anything)
const isPlainTextElement = makeMap('script,style,textarea', true);
const reCache: { [key: string]: any } = {};

const decodingMap = {
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&amp;': '&',
	'&#10;': '\n',
	'&#9;': '\t',
	'&#39;': "'",
} as const;
const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g;

// #5992
const isIgnoreNewlineTag = makeMap('pre,textarea', true);
const shouldIgnoreFirstNewline = (tag: string, html: string) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n';

function decodeAttr(value: string, shouldDecodeNewlines: boolean) {
	const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
	// @ts-ignore
	return value.replace(re, match => decodingMap[match]);
}

const scriptMap = {
	script: 'js',
	style: 'css',
} as const;

/**
 * 解析html
 */
export function parseHTML(html: string): Freeze<HTMLParse[], true>;
export function parseHTML<T extends boolean>(html: string, freeze: T): Freeze<HTMLParse[], T>;
export function parseHTML<T extends boolean>(
	html: string,
	freeze?: T,
): Freeze<HTMLParse[], T extends undefined ? true : T> {
	if (!isBoolean(freeze)) {
		freeze = true as T & boolean;
	}
	const _freeze = freeze as boolean;
	const stack: any[] = [];
	const result: HTMLParse[] = [];
	let index = 0;
	let last: string, lastTag: string;
	while (html) {
		last = html;
		// Make sure we're not in a plaintext content element like script/style
		// @ts-ignore
		if (!lastTag || !isPlainTextElement(lastTag)) {
			let textEnd = html.indexOf('<');
			if (textEnd === 0) {
				// Comment:
				if (comment.test(html)) {
					const commentEnd = html.indexOf('-->');
					if (commentEnd >= 0) {
						advance(commentEnd + 3);
						continue;
					}
				}

				// http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
				if (conditionalComment.test(html)) {
					const conditionalEnd = html.indexOf(']>');
					if (conditionalEnd >= 0) {
						advance(conditionalEnd + 2);
						continue;
					}
				}

				// Doctype:
				const doctypeMatch = html.match(doctype);
				if (doctypeMatch) {
					advance(doctypeMatch[0].length);
					continue;
				}

				// End tag:
				const endTagMatch = html.match(endTag);
				if (endTagMatch) {
					const curIndex = index;
					advance(endTagMatch[0].length);
					parseEndTag(endTagMatch[1], curIndex, index);
					continue;
				}

				// Start tag:
				const startTagMatch = parseStartTag();
				if (startTagMatch) {
					handleStartTag(startTagMatch);
					if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
						advance(1);
					}
					continue;
				}
			}

			let text, rest, next;
			if (textEnd >= 0) {
				rest = html.slice(textEnd);
				while (
					!endTag.test(rest) &&
					!startTagOpen.test(rest) &&
					!comment.test(rest) &&
					!conditionalComment.test(rest)
				) {
					// < in plain text, be forgiving and treat it as text
					next = rest.indexOf('<', 1);
					if (next < 0) {
						break;
					}
					textEnd += next;
					rest = html.slice(textEnd);
				}
				text = html.substring(0, textEnd);
			}

			if (textEnd < 0) {
				text = html;
			}

			if (text) {
				const completeText = text.trim();
				if (completeText && stack.length > 0) {
					const textTarget: HTMLParseText = {
						type: 'text',
						text: completeText,
						start: index,
						end: index + completeText.length,
					};
					toFreeze(textTarget, freeze);
					stack[stack.length - 1].children.push(textTarget);
				}
				advance(text.length);
			}
		} else {
			let endTagLength = 0;
			const stackedTag = lastTag.toLowerCase();
			const reStackedTag =
				reCache[stackedTag] ||
				(reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
			const rest = html.replace(reStackedTag, function (all, text, endTag) {
				endTagLength = endTag.length;
				if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
					text = text
						.replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
						.replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
				}
				if (shouldIgnoreFirstNewline(stackedTag, text)) {
					text = text.slice(1);
				}
				return '';
			});
			index += html.length - rest.length;
			html = rest;
			parseEndTag(stackedTag, index - endTagLength, index);
		}

		if (html === last) {
			break;
		}
	}

	// Clean up any remaining tags
	parseEndTag();

	function advance(n: number) {
		index += n;
		html = html.substring(n);
	}

	function parseScript(type: keyof typeof scriptMap, item: HTMLParseScript) {
		const scriptMatch = new RegExp(`^<\\/${type}[^>]*>`);
		let text = '';
		while (!scriptMatch.test(html)) {
			text += html.slice(0, 1);
			advance(1);
		}
		if (text.length > 0) {
			const textTarget: HTMLParseText = {
				type: 'text',
				text,
				start: index,
				end: index + text.length,
			};
			toFreeze(textTarget, _freeze);
			item.children.push(textTarget);
		}
	}

	function parseStartTag() {
		const start = html.match(startTagOpen);
		if (start) {
			const match: { [key: string]: any } = {
				tagName: start[1],
				attrs: [],
				start: index,
			};
			advance(start[0].length);
			let end, attr: any;
			while (
				!(end = html.match(startTagClose)) &&
				(attr = html.match(dynamicArgAttribute) || html.match(attribute))
			) {
				attr.start = index;
				advance(attr[0].length);
				attr.end = index;
				match.attrs.push(attr);
			}
			if (end) {
				match.unarySlash = end[1];
				advance(end[0].length);
				match.end = index;
				return match;
			}
		}
	}

	function handleStartTag(match: any) {
		const tagName = match.tagName;
		const unarySlash = match.unarySlash;

		if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
			parseEndTag(lastTag);
		}

		if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
			parseEndTag(tagName);
		}

		// 是否是单标签或者有反斜杠结束
		const unary = isUnaryTag(tagName) || !!unarySlash;

		const l = match.attrs.length;
		const attrs = new Array(l);
		for (let i = 0; i < l; i++) {
			const args = match.attrs[i];
			const value = args[3] || args[4] || args[5] || '';
			attrs[i] = {
				name: args[1],
				value: decodeAttr(value, true),
			};
		}

		const isScript = tagName in scriptMap;

		const item: HTMLParseScript | HTMLParseTag = {
			...(isScript
				? {
						type: 'script',
						script: scriptMap[tagName as 'script' | 'style'],
					}
				: {
						type: 'tag',
					}),
			tag: tagName,
			lowerCasedTag: tagName.toLowerCase(),
			attrs: attrs,
			start: match.start,
			end: match.end,
			startTagIndex: match.start,
			endTagIndex: -1,
			children: [],
		};
		if (stack.length > 0) {
			const target = stack[stack.length - 1];
			target.children.push(item);
		} else {
			result.push(item);
		}
		stack.push(item);
		lastTag = tagName;
		if (unary) {
			parseEndTag(tagName, void 0, void 0, true);
		}
		if (isScript) {
			parseScript(tagName as 'script' | 'style', item as HTMLParseScript);
		}
	}

	function parseEndTag(tagName?: string, start?: number, end?: number, isUnary?: boolean) {
		let pos, lowerCasedTagName;
		if (start == null) {
			start = index;
		}
		if (end == null) {
			end = index;
		}
		if (isUnary == null) {
			isUnary = false;
		}

		// Find the closest opened tag of the same type
		if (tagName) {
			lowerCasedTagName = tagName.toLowerCase();
			for (pos = stack.length - 1; pos >= 0; pos--) {
				if (stack[pos].lowerCasedTag === lowerCasedTagName) {
					break;
				}
				const notCloseTagTarget = stack[pos];
				// 单标签，并且栈内数据不匹配处理
				if (notCloseTagTarget && isUnary) {
					notCloseTagTarget.endTagIndex = notCloseTagTarget.end;
					// 设置完结束索引后再冻结对象
					toFreeze(notCloseTagTarget, _freeze);
					const notCloseTagTargetChildren = notCloseTagTarget.children.splice(0);
					const insert = stack[pos - 1];
					if (insert) {
						insert.children.push(...notCloseTagTargetChildren);
					}
				}
			}
			const correctCloseTarget = stack[pos];
			if (correctCloseTarget) {
				correctCloseTarget.endTagIndex = end;
				toFreeze(correctCloseTarget, _freeze);
			}
		} else {
			// If no tag name is provided, clean shop
			pos = 0;
		}

		if (pos >= 0) {
			// Remove the open elements from the stack
			stack.length = pos;
			lastTag = pos && stack[pos - 1].tag;
		}
	}
	return toFreeze(result, freeze);
}
