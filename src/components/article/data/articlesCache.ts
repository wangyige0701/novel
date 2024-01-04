import type { ArticleReturnVal } from '@/regular/@types/article';
import type { ShallowReactive, ComputedRef, Ref } from 'vue';
import { shallowReactive, computed, watch } from 'vue';
import { AsyncQueue } from '@/utils/asyncQueue';
import { article } from '@/regular';
import { voidFunc } from '@/utils/simples';
import { $_nextTick } from '@/utils/nextTick';
import { randomString } from '@/utils/random';

type ArticleReturnValHasKey = ArticleReturnVal & { __key: string };

/** 请求队列 */
const RequestQueue = new AsyncQueue<ArticleReturnVal>(3);

function createKey(data: ArticleReturnVal): ArticleReturnValHasKey {
	return Object.assign(data, { __key: randomString() });
}

function request(articleId: string) {
	return new Promise<ArticleReturnValHasKey>((resolve, reject) => {
		RequestQueue.add(article.bind(null, articleId))
			.then(data => {
				if (!data) {
					return resolve(data);
				}
				resolve(createKey(data));
			})
			.catch(reject);
	});
}

export class SettingAtricleCaches {
	private static stopSign: { [key: string]: { [key: string]: boolean } } = {};

	private _Instance_Key: string;

	/** 前面章节的数据列表 */
	private beforeList: ShallowReactive<ArticleReturnValHasKey[]>;
	/** 后面章节的数据列表 */
	private afterList: ShallowReactive<ArticleReturnValHasKey[]>;
	private reading: ShallowReactive<[] | [ArticleReturnValHasKey]>;
	private readingKey: Ref<string>;
	private result: ComputedRef<ArticleReturnValHasKey[]>;
	private cacheLength: number;

	public onError?: (reason: any) => any;
	public onReadingChange?: (article: ArticleReturnValHasKey) => any;

	private createOverSign() {
		const key = randomString();
		SettingAtricleCaches.stopSign[this._Instance_Key][key] = true;
		const target = SettingAtricleCaches.stopSign[this._Instance_Key];
		return {
			get value() {
				if (target[key] === true) {
					return true;
				} else {
					delete target[key];
					return false;
				}
			},
		};
	}

	/**
	 * @param cacheLength 缓存的长度
	 */
	constructor(cacheLength: number = 5) {
		this._Instance_Key = randomString();
		SettingAtricleCaches.stopSign[this._Instance_Key] = {};
		this.cacheLength = cacheLength;
		this.beforeList = shallowReactive<ArticleReturnValHasKey[]>([]);
		this.afterList = shallowReactive<ArticleReturnValHasKey[]>([]);
		this.reading = shallowReactive<[ArticleReturnValHasKey] | []>([]);
		this.readingKey = ref('');
		this.result = computed(() => [...this.beforeList, ...this.reading, ...this.afterList]);
		watch(
			() => this.reading[0],
			newValue => {
				this.onReadingChange?.(newValue);
				if (newValue) {
					const { __key } = newValue;
					this.readingKey.value = __key;
				}
			},
			{
				immediate: true,
			},
		);
	}

	/** 渲染列表 */
	get value() {
		return this.result.value;
	}

	/** 获取正在阅读的对象 */
	get nowRead() {
		return this.reading[0];
	}

	get nowReadKey() {
		return this.readingKey.value;
	}

	init(id: string) {
		this.stop();
		const _sign = this.createOverSign();
		$_nextTick(() => {
			this.beforeList.length = 0;
			this.afterList.length = 0;
			this.reading.length = 0;
			request(id)
				.then(data => {
					if (!_sign.value) {
						return;
					}
					if (!data) {
						return;
					}
					this.reading.splice(0, 1, data);
					const { prev_href, next_href } = data;
					this.get_prev(prev_href, true);
					this.get_next(next_href, true);
				})
				.catch(this.onError ?? voidFunc);
		});
	}

	/** 重置缓存长度 */
	resetCacheLength(num: number) {
		this.cacheLength = num;
		if (this.beforeList.length < num) {
			const { prev_href } = this.beforeList[0];
			this.get_prev(prev_href, true);
		}
		if (this.afterList.length < num) {
			const { next_href } = this.afterList[this.afterList.length - 1];
			this.get_next(next_href, true);
		}
	}

	/** 终止当前递归的请求 */
	stop() {
		const target = SettingAtricleCaches.stopSign[this._Instance_Key];
		for (const key in target) {
			target[key] = false;
		}
	}

	/** 上一个 */
	previous() {
		const first = this.beforeList[0];
		if (!first) {
			return;
		}
		const { prev_href } = first;
		this.get_prev(prev_href);
	}

	/** 下一个 */
	next() {
		const last = this.afterList[this.afterList.length - 1];
		if (!last) {
			return;
		}
		const { next_href } = last;
		this.get_next(next_href);
	}

	private get_prev(id: string, recursive: boolean = false, _sign?: ReturnType<typeof this.createOverSign>) {
		if (!id) {
			return;
		}
		if (!_sign) {
			_sign = this.createOverSign();
		}
		if (!_sign!.value) {
			return;
		}
		request(id)
			.then(data => {
				if (!_sign!.value) {
					// 如果请求已经取消，则不执行后续逻辑
					return;
				}
				if (!data) {
					return;
				}
				if (!recursive) {
					// 不遍历，则进行列表数据替换
					this.reading.splice(0, 1, ...this.beforeList.splice(this.beforeList.length - 1, 1));
				}
				let number = this.beforeList.length;
				if (number >= this.cacheLength) {
					return;
				}
				number = this.beforeList.unshift(data);
				if (recursive && number < this.cacheLength) {
					this.get_prev(data.prev_href, true, _sign);
				}
			})
			.catch(this.onError ?? voidFunc);
	}

	private get_next(id: string, recursive: boolean = false, _sign?: ReturnType<typeof this.createOverSign>) {
		if (!id) {
			return;
		}
		if (!_sign) {
			_sign = this.createOverSign();
		}
		if (!_sign!.value) {
			return;
		}
		request(id)
			.then(data => {
				if (!_sign!.value) {
					return;
				}
				if (!data) {
					return;
				}
				if (!recursive) {
					this.reading.splice(0, 1, ...this.afterList.splice(0, 1));
				}
				let number = this.afterList.length;
				if (number >= this.cacheLength) {
					return;
				}
				number = this.afterList.push(data);
				if (recursive && number < this.cacheLength) {
					this.get_next(data.next_href, true, _sign);
				}
			})
			.catch(this.onError ?? voidFunc);
	}
}
