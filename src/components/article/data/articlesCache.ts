import type { ArticleReturnVal } from '@/regular/@types/article';
import { reactive } from 'vue';

export class SettingAtricleCaches {
	private beforeList: ArticleReturnVal[] = [];
	private afterList: ArticleReturnVal[] = [];
	private cacheLength: number;

	/**
	 * @param cacheLength 缓存的长度
	 */
	constructor(cacheLength: number = 5) {
		this.cacheLength = cacheLength;
	}
}
