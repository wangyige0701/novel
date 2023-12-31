import type { ArticleReturnVal } from '@/regular/@types/article';
import type { ShallowReactive, ComputedRef } from 'vue';
import { shallowReactive, computed } from 'vue';
import { AsyncQueue } from '@/utils/asyncQueue';
import { article } from '@/regular';
import { voidFunc } from '@/utils/simples';
import { $_nextTick } from '@/utils/nextTick';
import { randomString } from '@/utils/random';

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
	private reading: ShallowReactive<[] | [ArticleReturnVal]>;
	private result: ComputedRef<ArticleReturnVal[]>;
	private cacheLength: number;
	private isStop = false;

	public onError?: (reason: any) => any;

	/**
	 * @param cacheLength 缓存的长度
	 */
	constructor(cacheLength: number = 5) {
		this.cacheLength = cacheLength;
		this.beforeList = shallowReactive<ArticleReturnVal[]>([]);
		this.afterList = shallowReactive<ArticleReturnVal[]>([]);
		this.reading = shallowReactive<[ArticleReturnVal] | []>([]);
		this.result = computed(() => {
			this.beforeList;
			this.afterList;
			if (this.reading.length === 1) {
				return [...this.beforeList, ...this.reading, ...this.afterList];
			} else {
				return [];
			}
		});
	}

	init(id: string) {
		this.stop();
		$_nextTick(() => {
			this.beforeList.length = 0;
			this.afterList.length = 0;
			this.reading.length = 0;
			this.isStop = false;
			request(id)
				.then(data => {
					if (!data) {
						return;
					}
					this.reading.splice(0, 1, this.createKey(data));
					const { prev_href, next_href } = data;
					this.get_prev(prev_href, true);
					this.get_next(next_href, true);
				})
				.catch(this.onError ?? voidFunc);
		});
	}

	stop() {
		this.isStop = true;
	}

	/** 渲染列表 */
	get value() {
		return this.result.value;
	}

	/** 上一个 */
	previous() {
		const first = this.beforeList[0];
		if (!first) {
			return;
		}
		this.reading.splice(0, 1, ...this.beforeList.splice(this.beforeList.length - 1, 1));
		const { prev_href } = first;
		this.get_prev(prev_href);
	}

	/** 下一个 */
	next() {
		const last = this.afterList[this.afterList.length - 1];
		if (!last) {
			return;
		}
		this.reading.splice(0, 1, ...this.afterList.splice(0, 1));
		const { next_href } = last;
		this.get_next(next_href);
	}

	private createKey(data: ArticleReturnVal) {
		return Object.assign(data, { __key: randomString() });
	}

	private get_prev(id: string, recursive: boolean = false) {
		if (!id || this.isStop) {
			return;
		}
		request(id)
			.then(data => {
				if (this.beforeList.length >= this.cacheLength) {
					return;
				}
				let number = this.beforeList.length;
				if (data) {
					number = this.beforeList.unshift(this.createKey(data));
				}
				if (recursive && number < this.cacheLength) {
					this.get_prev(data.prev_href, true);
				}
			})
			.catch(this.onError ?? voidFunc);
	}

	private get_next(id: string, recursive: boolean = false) {
		if (!id || this.isStop) {
			return;
		}
		request(id)
			.then(data => {
				if (this.afterList.length >= this.cacheLength) {
					return;
				}
				let number = this.afterList.length;
				if (data) {
					number = this.afterList.push(this.createKey(data));
				}
				if (recursive && number < this.cacheLength) {
					this.get_next(data.next_href, true);
				}
			})
			.catch(this.onError ?? voidFunc);
	}
}
