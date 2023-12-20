/**
 * 通过exec遍历匹配，防止断言语句造成索引错位，正则中有断言时使用
 * @param regexp
 * @param str
 * @returns
 */
export function regexpMatchWithNoAdvance(regexp: RegExp, str: string) {
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
