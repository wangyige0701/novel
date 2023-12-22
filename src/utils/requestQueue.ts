type RequestItem<T> = () => Promise<T>;

/**
 * 请求队列
 */
export class RequestQueue<T> {
	totalNum: number;
	queue: Array<{ func: RequestItem<T>; resolve: ResolveFunc; reject: RejectFunc }> = [];
	runningNum: number = 0;

	/**
	 * @param num 一次最多同时执行的请求数量
	 */
	constructor(num: number = 3) {
		this.totalNum = num;
	}

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

	execute() {
		if (this.runningNum >= this.totalNum) {
			return;
		}
		if (this.queue.length === 0) {
			return;
		}
		this.runningNum++;
		const { func, resolve, reject } = this.queue.shift()!;
		func()
			.then(resolve)
			.catch(reject)
			.finally(() => {
				this.runningNum--;
				this.execute();
			});
	}
}
