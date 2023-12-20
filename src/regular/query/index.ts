import { handleSelector } from './selector';

/**
 * 通过解析树进行元素查找
 */
export function query(data: HTMLParse[]) {
	/**
	 * 将数据定位到body处
	 * @param d
	 * @returns
	 */
	function _body(d: HTMLParse[]): undefined | HTMLParseTag {
		const queue: HTMLParseTag[] = [];
		for (const item of d) {
			if (item.type === 'tag') {
				if (item.tag === 'body') {
					return item;
				}
				queue.push(item);
			}
		}
		while (queue.length > 0) {
			const item = queue.shift();
			if (item && item.children && item.children.length > 0) {
				const result = _body(item.children);
				if (result) {
					return result;
				}
			}
		}
		return;
	}
	const bodyTarget = _body(data);
	// 定位到body内
	return function (selector: string) {
		if (!bodyTarget) {
			return;
		}
		const parseResult = handleSelector(selector);
		console.log(parseResult);

		return;
	};
}
