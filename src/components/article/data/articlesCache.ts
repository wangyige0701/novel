import type { ArticleReturnVal } from '@common/regular/@types/article';
import type { ShallowReactive, ComputedRef, Ref } from 'vue';
import { shallowReactive, computed, watch } from 'vue';
import { AsyncQueue } from '@common/utils/asyncQueue';
import { article } from '@common/regular';
import { voidFunc } from '@common/utils/simples';
import { $_nextTick } from '@common/utils/nextTick';
import { randomString } from '@common/utils/random';
import { immediate } from '@/config/watch';

type ArticleReturnValHasKey = ArticleReturnVal & { __key: string };

const getRandomString = randomString();

/** 请求队列 */
const RequestQueue = new AsyncQueue<ArticleReturnVal>(3);

function createKey(data: ArticleReturnVal): ArticleReturnValHasKey {
	return Object.assign(data, { __key: getRandomString() });
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
	private prev_loading: Ref<boolean>;
	private prev_error: Ref<boolean>;
	private next_loading: Ref<boolean>;
	private next_error: Ref<boolean>;
	private result: ComputedRef<ArticleReturnValHasKey[]>;
	private cacheLength: number;

	public onError?: (reason: any) => any;
	public onReadingChange?: (article: ArticleReturnValHasKey) => any;

	private createOverSign() {
		const key = getRandomString();
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
		this._Instance_Key = getRandomString();
		SettingAtricleCaches.stopSign[this._Instance_Key] = {};
		this.cacheLength = cacheLength;
		this.beforeList = shallowReactive<ArticleReturnValHasKey[]>([]);
		this.afterList = shallowReactive<ArticleReturnValHasKey[]>([]);
		this.reading = shallowReactive<[ArticleReturnValHasKey] | []>([]);
		this.readingKey = ref('');
		this.prev_loading = ref(false);
		this.prev_error = ref(false);
		this.next_loading = ref(false);
		this.next_error = ref(false);
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
			immediate,
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

	get prevLoading() {
		return this.prev_loading.value;
	}

	get prevError() {
		return this.prev_error.value;
	}

	get nextLoading() {
		return this.next_loading.value;
	}

	get nextError() {
		return this.next_error.value;
	}

	/** 是否需要显示提示文字 */
	get prevTip() {
		return this.prevLoading || this.prevError;
	}

	/** 是否需要显示提示文字 */
	get nextTip() {
		return this.nextLoading || this.nextError;
	}

	get prevInfo() {
		if (this.prev_loading.value) {
			return '加载中...';
		}
		if (this.prev_error.value) {
			return '加载失败';
		}
		return;
	}

	get nextInfo() {
		if (this.next_loading.value) {
			return '加载中...';
		}
		if (this.next_error.value) {
			return '加载失败';
		}
		return;
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

	/** 跳转到指定id章节处 */
	jump(id: string) {
		const index = this.result.value.findIndex(item => item.id === id);
		if (index === -1) {
			this.init(id);
			return;
		}
		const readingIndex = this.result.value.findIndex(item => item.__key === this.readingKey.value);
		if (readingIndex === index) {
			return;
		}
		const _before = this.result.value.slice(0, index);
		const _after = this.result.value.slice(index + 1);
		const _reading = this.result.value.slice(index, index + 1);
		this.beforeList.splice(
			0,
			this.beforeList.length,
			..._before.slice(_before.length - this.cacheLength < 0 ? 0 : _before.length - this.cacheLength),
		);
		this.afterList.splice(0, this.afterList.length, ..._after.slice(0, this.cacheLength));
		this.reading.splice(0, this.reading.length, ..._reading);
		$_nextTick(() => {
			if (this.beforeList.length < this.cacheLength) {
				const target = this.beforeList[0] || this.reading[0];
				if (target) {
					this.get_prev(target.prev_href, true);
				}
			}
			if (this.afterList.length < this.cacheLength) {
				const target = this.afterList[this.afterList.length - 1] || this.reading[0];
				if (target) {
					this.get_next(target.next_href, true);
				}
			}
		});
	}

	/** 上一个 */
	prev() {
		const first = this.beforeList[0];
		if (!first) {
			return;
		}
		const { id } = this.beforeList[this.beforeList.length - 1];
		this.jump(id);
	}

	/** 下一个 */
	next() {
		const last = this.afterList[this.afterList.length - 1];
		if (!last) {
			return;
		}
		const { id } = this.afterList[0];
		this.jump(id);
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
		if (recursive) {
			const index = this.beforeList.findIndex(item => item.id === id);
			if (index > 0) {
				this.get_prev(this.beforeList[index - 1].id, true, _sign);
				return;
			}
		}
		if (this.beforeList.length <= 1) {
			this.prev_loading.value = true;
		}
		this.prev_error.value = false;
		request(id)
			.then(data => {
				if (!_sign!.value) {
					// 如果请求已经取消，则不执行后续逻辑
					return;
				}
				if (!data) {
					return;
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
			.catch(err => {
				this.prev_error.value = true;
				this.onError?.(err);
			})
			.finally(() => {
				this.prev_loading.value = false;
			});
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
		if (recursive) {
			const index = this.afterList.findIndex(item => item.id === id);
			if (index > -1 && index < this.cacheLength - 1) {
				this.get_next(this.afterList[index + 1].id, true, _sign);
				return;
			}
		}
		if (this.afterList.length <= 1) {
			this.next_loading.value = true;
		}
		this.next_error.value = false;
		request(id)
			.then(data => {
				if (!_sign!.value) {
					return;
				}
				if (!data) {
					return;
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
			.catch(err => {
				this.next_error.value = true;
				this.onError?.(err);
			})
			.finally(() => {
				this.next_loading.value = false;
			});
	}
}
