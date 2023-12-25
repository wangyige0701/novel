import { $_nextTick } from './nextTick';

type RequestItem<T> = () => Promise<T>;

/**
 * 异步队列
 */
export class AsyncQueue<T> {
	private totalNum: number;
	private queue: Array<{ func: RequestItem<T>; resolve: ResolveFunc<T>; reject: RejectFunc }> = [];
	private runningNum: number = 0;
	private emptyUseList: Array<() => void> = [];

	/**
	 * @param num 一次最多同时执行的请求数量
	 */
	constructor(num: number = 3) {
		this.totalNum = num;
	}

	/**
	 * 新增一个返回promise的函数
	 * @param func
	 * @returns
	 */
	add(func: RequestItem<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			if (!func) {
				return;
			}
			this.queue.push({
				func,
				resolve,
				reject,
			});
			this.execute();
		});
	}

	/**
	 * 开始执行
	 * @returns
	 */
	private execute() {
		if (this.runningNum >= this.totalNum) {
			return;
		}
		if (this.queue.length === 0) {
			if (this.runningNum === 0) {
				this.triggerAllEmptyFunc();
			}
			return;
		}
		this.runningNum++;
		const { func, resolve, reject } = this.queue.shift()!;
		func()
			.then(resolve)
			.catch(reject)
			.finally(() => {
				// 通过微队列触发，防止还未执行完成就触发到了队列清空回调函数
				$_nextTick(() => {
					this.runningNum--;
					this.execute();
				});
			});
	}

	/**
	 * 注册一个在队列清空时触发一次的函数
	 * @param callback
	 */
	empty(callback: () => void) {
		if (!this.emptyUseList.includes(callback)) {
			this.emptyUseList.push(callback);
		}
	}

	private triggerAllEmptyFunc() {
		this.emptyUseList.forEach(callback => callback?.());
	}
}
