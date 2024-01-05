import type { MergeListReturnVal } from '../@types/search';
import type { HomePageExcludeChapter, HomePageReturnVal } from '../@types/homepage';
import type { ArticleReturnVal } from '../@types/article';
import { testReq } from '@/api/__test/request';

type A = MergeListReturnVal[];
type B = HomePageExcludeChapter;
type C = HomePageReturnVal;
type D = ArticleReturnVal;

export function testRequestList(any: string) {
	return new Promise<MergeListReturnVal[]>((resolve, reject) => {
		testReq(any)
			.then(data => {
				resolve(data as A);
			})
			.catch(reject);
	});
}

export function testRequestHome(any: string) {
	return new Promise<HomePageExcludeChapter>((resolve, reject) => {
		testReq(any)
			.then(data => {
				resolve(data as B);
			})
			.catch(reject);
	});
}

export function testRequestChapter(any: string) {
	return new Promise<HomePageReturnVal>((resolve, reject) => {
		testReq(any)
			.then(data => {
				resolve(data as C);
			})
			.catch(reject);
	});
}

export function testRequestArticle(any: string) {
	return new Promise<ArticleReturnVal>((resolve, reject) => {
		testReq(any)
			.then(data => {
				resolve(data as D);
			})
			.catch(reject);
	});
}
