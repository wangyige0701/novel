import { describe, it } from 'vitest';

describe('biqu', () => {
	const base = 'https://www.xbiqu6.com';

	it('search', async () => {
		const url = `${base}/search/`;
		await fetch(url, {
			method: 'POST',
			body: `searchkey=${encodeURIComponent('斗破苍穹')}&submit=`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		})
			.then(res => {
				return res.text();
			})
			.then(res => {
				console.log(res);
			})
			.catch(err => {
				console.log(err);
			});
	});

	it('book', async () => {
		const url = `${base}/book/3662/`;
		await fetch(url)
			.then(res => {
				return res.text();
			})
			.then(res => {
				console.log(res);
			})
			.catch(err => {
				console.log(err);
			});
	});

	it('chapter', () => {});
});
