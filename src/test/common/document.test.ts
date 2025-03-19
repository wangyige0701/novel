import { describe, expect, it } from 'vitest';
import { parseHTML, parse } from '@/common/document';
import { matchAttr, matchClass, matchId, matchTag, parseAttr } from '@/common/document/match';
import { handleSelector } from '@/common/document/selector';
import { Combiner } from '@/common/document/combiner';

describe('selector parse', () => {
	it('match selectors', () => {
		const cls = '.a span'.match(matchClass);
		const id = '#b .d'.match(matchId);
		const tag = 'c .a'.match(matchTag);
		const attr = '[data-type="abc"] #id'.match(matchAttr);
		const attr2 = `[data-type='123'] .class`.match(matchAttr);
		const attr3 = `[data-type=false] div`.match(matchAttr);

		expect(cls?.groups?.cls).toBe('a');
		expect(id?.groups?.id).toBe('b');
		expect(tag?.groups?.tag).toBe('c');
		expect(attr?.groups?.attr).toBe('data-type="abc"');
		expect(attr2?.groups?.attr).toBe("data-type='123'");
		expect(attr3?.groups?.attr).toBe('data-type=false');
	});

	it('parse attrs', () => {
		const attr = '[data-type="abc"] #id'.match(matchAttr);
		const attr2 = `[data-type='123'] .class`.match(matchAttr);
		const attr3 = `[data-type=false] div`.match(matchAttr);

		const parse = attr!.groups!.attr.match(parseAttr);
		const parse2 = attr2!.groups!.attr.match(parseAttr);
		const parse3 = attr3!.groups!.attr.match(parseAttr);

		expect(parse?.groups?.name).toBe('data-type');
		expect(parse?.groups?.double).toBe('abc');
		expect(parse2?.groups?.name).toBe('data-type');
		expect(parse2?.groups?.single).toBe('123');
		expect(parse3?.groups?.name).toBe('data-type');
		expect(parse3?.groups?.full).toBe('false');
	});
});

describe('document parse', () => {
	const html = `<main id="main">
	<div style="font-size: 12px; color: red">
		<p class="abc" disabled=false>hello world1</p>
		<p class="abc aa" data-type="abc" data-a-test="true" disabled>hello world2</p>
		<p class="abc tt" data-type="abc" data-type="c">
			<input type="text" />
			<button disabled>hello world btn</button>
		</p>
		<span class="abc">hello world4</span>
	</div>
	<ul class="list">
		<li>
			<span class="item1">a</span>
			<span class="item2">1</span>
		</li>
		<li>
			<span class="item1">b</span>
			<span class="item2">2</span>
		</li>
		<li>
			<span class="item1">c</span>
			<span class="item2">3</span>
		</li>
		<li>
			<span class="item1">d</span>
			<span class="item2">4</span>
		</li>
	</ul>
</main>`;
	const dom = parse(html);

	it('parse html', () => {
		const result = parseHTML(html)[0];
		if (result.type !== 'tag') {
			throw new Error('parse error');
		}
		expect(result.parent).toBeUndefined();
		expect(result.tag).toBe('main');
		// div
		const children = result.children;
		expect(children.length).toBe(2);
		const child = children[0];
		if (child.type !== 'tag') {
			throw new Error('parse error');
		}
		expect(child.attrs).toEqual([
			{
				name: 'style',
				value: 'font-size: 12px; color: red',
			},
		]);
		expect(child.tag).toBe('div');
		expect(child.parent).toBe(result);
		expect(child.children.length).toBe(4);
	});

	it('parse selector', () => {
		const selector = `div > .class ~ #id + p[checked][data-type="true"] div.main`;
		const result = handleSelector(selector);
		expect(result[0].combiner).toBeUndefined();
		expect(result[0].selector).toEqual([{ type: 'tag', data: 'div' }]);
		expect(result[1].combiner).toBe(Combiner.CHILD);
		expect(result[1].selector).toEqual([{ type: 'class', data: ['class'] }]);
		expect(result[2].combiner).toBe(Combiner.SUBSEQUENT_SIBLING);
		expect(result[2].selector).toEqual([{ type: 'id', data: 'id' }]);
		expect(result[3].combiner).toBe(Combiner.NEXT_SIBLING);
		expect(result[3].selector).toEqual([
			{ type: 'tag', data: 'p' },
			{
				type: 'attr',
				data: [
					{ key: 'checked', value: '' },
					{ key: 'data-type', value: 'true' },
				],
			},
		]);
		expect(result[4].combiner).toBe(Combiner.DESCENDANT);
		expect(result[4].selector).toEqual([
			{ type: 'tag', data: 'div' },
			{ type: 'class', data: ['main'] },
		]);
	});

	it('query single', () => {
		const queryMainTag = dom.$('main');
		expect(queryMainTag?.parent).toBeUndefined();
		expect(queryMainTag.target?.startTagIndex).toBe(0);
		expect(queryMainTag.target?.tag).toBe('main');

		const queryChildDiv = dom.$('main > div');
		expect(queryChildDiv?.parent?.tag).toBe('main');
		expect(queryChildDiv?.target?.tag).toBe('div');
		expect(queryChildDiv?.target?.attrs).toEqual([{ name: 'style', value: 'font-size: 12px; color: red' }]);

		const queryFirstPTag = dom.$('p');
		expect(queryFirstPTag?.parent?.tag).toBe('div');
		expect(queryFirstPTag?.target?.tag).toBe('p');

		const ignoreTarget = dom.$('main p[data-type="c"]');
		expect(ignoreTarget.target).toBeUndefined();

		const queryLastPTag = dom.$(`div[style='font-size: 12px; color: red'] > p.abc ~ .tt`);
		expect(queryLastPTag?.target?.tag).toBe('p');
		expect(queryLastPTag?.target?.attrs).toEqual([
			{ name: 'class', value: 'abc tt' },
			{ name: 'data-type', value: 'abc' },
			{ name: 'data-type', value: 'c' },
		]);
		expect(queryLastPTag?.target?.parent).toBe(queryChildDiv?.target);
		expect(queryLastPTag?.children.length).toBe(2);
		const children = queryLastPTag?.children;
		if (!children || children[0].type !== 'tag') {
			throw new Error('children[0].type !== "tag"');
		}
		expect(children[0].tag).toBe('input');
		expect(queryLastPTag?.children[0].type).toBe('tag');

		const queryAny = dom.$('div > *');
		expect(queryAny.target?.tag).toBe('p');
		expect(queryAny.target?.attrs).toEqual([
			{ name: 'class', value: 'abc' },
			{ name: 'disabled', value: 'false' },
		]);
	});

	it('query all', () => {
		const queryAllPTag = dom.$$('p.abc');
		expect(queryAllPTag.length).toBe(3);
		expect(queryAllPTag.map(item => item.target?.tag)).toEqual(['p', 'p', 'p']);
		expect(queryAllPTag[1].target?.attrs).toEqual([
			{ name: 'class', value: 'abc aa' },
			{ name: 'data-type', value: 'abc' },
			{ name: 'data-a-test', value: 'true' },
			{ name: 'disabled', value: '' },
		]);

		const queryAllClass = dom.$$('.abc');
		expect(queryAllClass.length).toBe(4);
		expect(queryAllClass.map(item => item.target?.tag)).toEqual(['p', 'p', 'p', 'span']);
		expect(queryAllClass[3].children.length).toBe(1);
		expect(queryAllClass[3].children[0].type).toBe('text');
		const child = queryAllClass[3].children[0];
		if (child.type !== 'text') {
			throw new Error('child.type !== "text"');
		}
		expect(child.text).toBe('hello world4');

		const queryAllAny = dom.$$('div > *');
		expect(queryAllAny.length).toBe(4);
		expect(queryAllAny.map(item => item.target?.tag)).toEqual(['p', 'p', 'p', 'span']);
	});

	it('query extra funcs', () => {
		const getClass = dom.$('p.abc.tt');
		expect(getClass.class()).toBe('abc tt');
		expect(getClass.classList()).toEqual(['abc', 'tt']);

		const getStyle = dom.$('main > div');
		expect(getStyle.style()).toEqual({ 'font-size': '12px', color: 'red' });
		expect(getStyle.style('font-size')).toBe('12px');
		expect(getStyle.style('fontSize')).toBe('12px');

		const getId = dom.$('main#main');
		expect(getId.id()).toBe('main');

		const getAttr = dom.$('p.abc.tt');
		expect(getAttr.attr()).toEqual([
			{ name: 'class', value: 'abc tt' },
			{ name: 'data-type', value: 'abc' },
			{ name: 'data-type', value: 'c' },
		]);
		expect(getAttr.attr('data-type')).toBe('abc');

		const getDataset = dom.$('p.abc.aa');
		expect(getDataset.dataset()).toEqual({ type: 'abc', aTest: 'true' });
		expect(getDataset.dataset('a-test')).toBe('true');
		expect(getDataset.dataset('aTest')).toBe('true');

		const getText = dom.$('p.abc.tt > button');
		expect(getText.text()).toBe('hello world btn');

		const getBody = dom.body();
		expect(getBody.target).toBeUndefined();

		const getUl = dom.$$('main ul.list > li span.item1');
		expect(getUl.length).toBe(4);
	});
});

import { testHtml } from './html';

describe('document full test', () => {
	const dom = parse(testHtml);

	it('parse full html', () => {
		const result = dom.$$('div.container ul.txt-list > li span.s2 > a');
		const a = result.map(item => item.text());
		expect(a.length).toBe(31);
		expect(a.slice(-1)[0]).toBe('斗破苍穹神之炎帝');
	});
});
