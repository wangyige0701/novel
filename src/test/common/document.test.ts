import { describe, expect, it } from 'vitest';
import { parseHTML, parse } from '@/common/document';

describe('document parse', () => {
	it('parse html', () => {
		const html = '<div><p>hello world</p></div>';
		const a = parseHTML(html);
		const first = a[0];
		expect(first.type).toBe('tag');
		if (first.type === 'tag') {
			expect(first.tag).toBe('div');
			const second = first.children[0];
			expect(second.type).toBe('tag');
			if (second.type === 'tag') {
				expect(second.tag).toBe('p');
				expect(second.children[0].type).toBe('text');
			} else {
				throw new Error('second is not tag');
			}
		} else {
			throw new Error('first is not tag');
		}
	});

	it('parse selector', () => {
		const dom = parse('<div class="a" disabled data-type="b"><p>hello world</p></div>');
		const a = dom.$('div.a[disabled][data-type="b"]');
		console.log(a);
	});

	it('query html', () => {
		const dom = parse(
			`<main><div style="font-size: 12px; color: red"><p class="abc" data-type="abc" disabled>hello world</p></div></main>`,
		);
		const a = dom.$('div > p');
		const a1 = dom.$('div > p').attr();
		const b = dom.$('div > p').attr('class');
		const c = dom.$('div > p').classList();
		const d = dom.$('div').style();
		const e = dom.$('div').style('color');
		console.log(a);
	});
});
