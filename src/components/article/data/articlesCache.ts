import type { ArticleReturnVal } from '@/regular/@types/article';
import type { ShallowReactive, ComputedRef } from 'vue';
import { shallowReactive, computed, watch } from 'vue';
import { AsyncQueue } from '@/utils/asyncQueue';
import { article } from '@/regular';

/** 请求队列 */
const RequestQueue = new AsyncQueue<ArticleReturnVal>(3);

function request(articleId: string) {
	return new Promise<ArticleReturnVal>((resolve, reject) => {
		RequestQueue.add(article.bind(null, articleId)).then(resolve).catch(reject);
	});
}

export class SettingAtricleCaches {
	/** 前面章节的数据列表 */
	private beforeList: ShallowReactive<ArticleReturnVal[]>;
	/** 后面章节的数据列表 */
	private afterList: ShallowReactive<ArticleReturnVal[]>;
	private result: ComputedRef<ArticleReturnVal[]>;
	private reading?: ArticleReturnVal;
	private cacheLength: number;

	/**
	 * @param cacheLength 缓存的长度
	 */
	constructor(cacheLength: number = 5) {
		this.cacheLength = cacheLength;
		this.beforeList = shallowReactive<ArticleReturnVal[]>([]);
		this.afterList = shallowReactive<ArticleReturnVal[]>([]);
		this.result = computed(() => {
			if (this.reading) {
				return [...this.beforeList, this.reading, ...this.afterList];
			} else {
				return [];
			}
		});
	}

	init(id: string) {
		this.beforeList.length = 0;
		this.afterList.length = 0;
	}

	get value() {
		return this.result.value;
	}

	previous() {}

	next() {}
}
