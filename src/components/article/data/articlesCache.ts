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

function createOverSign(Instance_Key: string) {
	const key = getRandomString();
	SettingAtricleCaches.stopSign[Instance_Key][key] = true;
	const target = SettingAtricleCaches.stopSign[Instance_Key];
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

class DataRequest {
	public list: ShallowReactive<ArticleReturnValHasKey[]>;
	private _loading: Ref<boolean>;
	private _error: Ref<boolean>;
	private cacheLength: number;
	private state: 'after' | 'before';
	private _state: number;
	private _href: 'next_href' | 'prev_href';
	private _Instance_Key: string;
	private errorCallback: Function;

	constructor(
		Instance_Key: string,
		cacheLength: number,
		state: 'after' | 'before',
		errorCallback: (err: any) => any,
	) {
		this._Instance_Key = Instance_Key;
		this.cacheLength = cacheLength;
		this.state = state;
		this._state = Number(this.state === 'after'); // 1为after、0为before
		this._href = this._state === 1 ? 'next_href' : 'prev_href';
		this.list = shallowReactive<ArticleReturnValHasKey[]>([]);
		this._loading = ref(false);
		this._error = ref(false);
		this.errorCallback = errorCallback;
	}

	/**
	 * 获取指定位置的数据
	 * @param posi `end`：末端数据，before的第一个数据，after的最后一个数据，即离中心数据最远的数据；`start`：近端数据，离中心最近的数据
	 * @returns
	 */
	getData(posi: 'end' | 'start') {
		const _posi = Number(posi === 'end'); // 1为end、0为start
		if ((_posi ^ this._state) === 1) {
			return this.list[this.list.length - 1];
		}
		return this.list[0];
	}

	/** 重置列表长度 */
	reset() {
		this.list.length = 0;
	}

	/** 重置缓存长度 */
	resetCacheLength(num: number) {
		this.cacheLength = num;
		if (this.list.length < num) {
		}
	}

	/** 根据数据实例状态插入一条数据，after在最后插入，before在最前方插入 */
	insert(data: ArticleReturnValHasKey) {
		if (this._state === 1) {
			return this.list.push(data);
		}
		return this.list.unshift(data);
	}

	/** 根据回调函数获取指定数据的索引，before状态的列表会反向 */
	findIndex(callback: (item: ArticleReturnValHasKey) => boolean) {
		const index = this.list.findIndex(callback);
		if (this._state === 1) {
			return index;
		}
		if (index < 0) {
			return index;
		}
		return -1 * index + this.cacheLength - 1;
	}

	/** 获取列表数据 */
	get(index: number) {
		if (index < 0 || index >= this.list.length) {
			return;
		}
		if (this._state === 1) {
			return this.list[index];
		}
		return this.list[-1 * index + this.cacheLength - 1];
	}

	/** 检查缓存列表完整性，如果未填满列表则继续请求数据 */
	checkFull(noneData: ArticleReturnValHasKey) {
		if (this.list.length < this.cacheLength) {
			const target = this.getData('end') || noneData;
			if (target && target[this._href]) {
				this.requestData(target[this._href], true);
			}
		}
	}

	/** 获取邻接数据 */
	adjoinId(callback: (id: string) => any) {
		const end = this.getData('end');
		if (!end) {
			return;
		}
		const { id } = this.getData('start');
		callback(id);
	}

	/** 根据状态请求数据并插入 */
	requestData(id: string, recursive: boolean = false, _sign?: ReturnType<typeof createOverSign>) {
		if (!id) {
			return;
		}
		if (!_sign) {
			_sign = createOverSign(this._Instance_Key);
		}
		if (!_sign.value) {
			return;
		}
		if (recursive) {
			// 判断是否到达边界，如果未抵达列表已有数据中的最远端，则指针继续移动
			const index = this.findIndex(item => item.id === id);
			if (index > -1 && index < this.list.length - 1) {
				this.requestData(this.get(index + 1)!.id, true, _sign);
				return;
			}
		}
		if (this.list.length <= 1) {
			this._loading.value = true;
		}
		this._error.value = false;
		request(id)
			.then(data => {
				if (!_sign!.value) {
					return;
				}
				if (!data) {
					return;
				}
				let number = this.list.length;
				if (number >= this.cacheLength) {
					return;
				}
				number = this.insert(data);
				if (recursive && number < this.cacheLength) {
					// 递归调用
					this.requestData(data[this._href], true, _sign);
				}
			})
			.catch(err => {
				this._error.value = true;
				this.errorCallback(err);
			})
			.finally(() => {
				this._loading.value = false;
			});
	}

	get loading() {
		return this._loading.value;
	}

	get error() {
		return this._error.value;
	}

	get tip() {
		return this.loading || this.error;
	}

	get info() {
		if (this.loading) {
			return '加载中...';
		}
		if (this.error) {
			return '加载失败';
		}
		return;
	}
}

export class SettingAtricleCaches {
	public static stopSign: { [key: string]: { [key: string]: boolean } } = {};

	private _Instance_Key: string;

	private before: DataRequest;
	private after: DataRequest;

	private reading: ShallowReactive<[] | [ArticleReturnValHasKey]>;
	private readingKey: Ref<string>;
	private result: ComputedRef<ArticleReturnValHasKey[]>;
	private cacheLength: number;

	public onError?: (reason: any) => any;
	public onReadingChange?: (article: ArticleReturnValHasKey) => any;

	/**
	 * @param cacheLength 缓存的长度
	 */
	constructor(cacheLength: number = 5) {
		this._Instance_Key = getRandomString();
		SettingAtricleCaches.stopSign[this._Instance_Key] = {};
		this.cacheLength = cacheLength;

		this.before = new DataRequest(this._Instance_Key, this.cacheLength, 'before', err => this.onError);
		this.after = new DataRequest(this._Instance_Key, this.cacheLength, 'after', err => this.onError);

		this.reading = shallowReactive<[ArticleReturnValHasKey] | []>([]);
		this.readingKey = ref('');
		this.result = computed(() => [...this.before.list, ...this.reading, ...this.after.list]);
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

	/** 初始化 */
	init(id: string) {
		this.stop();
		const _sign = createOverSign(this._Instance_Key);
		$_nextTick(() => {
			this.before.reset();
			this.after.reset();
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
					this.before.requestData(prev_href, true);
					this.after.requestData(next_href, true);
				})
				.catch(this.onError ?? voidFunc);
		});
	}

	/** 重置缓存长度 */
	resetCacheLength(num: number) {
		this.cacheLength = num < 1 ? 1 : num;
		this.before.resetCacheLength(this.cacheLength);
		this.after.resetCacheLength(this.cacheLength);
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
		this.before.list.splice(
			0,
			this.before.list.length,
			..._before.slice(_before.length - this.cacheLength < 0 ? 0 : _before.length - this.cacheLength),
		);
		this.after.list.splice(0, this.after.list.length, ..._after.slice(0, this.cacheLength));
		this.reading.splice(0, this.reading.length, ..._reading);
		$_nextTick(() => {
			const nodeData = this.reading[0];
			this.before.checkFull(nodeData);
			this.after.checkFull(nodeData);
		});
	}

	/** 上一个 */
	prev() {
		const first = this.before.getData('end');
		if (!first) {
			return;
		}
		const { id } = this.before.getData('start');
		this.jump(id);
	}

	/** 下一个 */
	next() {
		const last = this.after.getData('end');
		if (!last) {
			return;
		}
		const { id } = this.after.getData('start');
		this.jump(id);
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
		return this.before.loading;
	}

	get prevError() {
		return this.before.error;
	}

	get nextLoading() {
		return this.after.loading;
	}

	get nextError() {
		return this.after.error;
	}

	/** 是否需要显示提示文字 */
	get prevTip() {
		return this.before.tip;
	}

	/** 是否需要显示提示文字 */
	get nextTip() {
		return this.after.tip;
	}

	get prevInfo() {
		return this.before.info;
	}

	get nextInfo() {
		return this.after.info;
	}
}
