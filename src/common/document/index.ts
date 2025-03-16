import { parseHTML } from './parse';
import { query } from './query';

export { parseHTML, query };

/**
 * 解析 HTML 字符串，返回一个查询对象，支持以下选择器：
 * - `#id`：通过 id 选择元素
 * - `.class`：通过 class 选择元素
 * - `tag`：通过标签名选择元素
 * - `*`：选择所有元素
 * - `[attr=value]`：通过属性选择元素
 */
export function parse(html: string) {
	return query(parseHTML(html, false));
}
