import { parseHTML } from './parse';
import { query } from './query';

export { parseHTML, query };

/**
 * 解析 HTML 字符串，返回一个查询对象
 */
export function parse(html: string) {
	return query(parseHTML(html, false));
}
