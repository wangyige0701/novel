import { testReq } from '@/api/__test/request';

export function testRequest(any: any) {
	return new Promise<any>((resolve, reject) => {
		testReq(any)
			.then(data => {
				resolve(data);
			})
			.catch(reject);
	});
}
