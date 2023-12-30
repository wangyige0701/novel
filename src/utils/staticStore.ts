interface UniappDeciceInfo extends UniApp.GetDeviceInfoResult {}

interface GlobalStoreData extends Omit<UniappDeciceInfo, 'model' | 'brand'> {
	/** 状态栏高度 */
	statusBarHeight: number;
}

/** 全局静态数据储存仓库，不同于vuex的store，没有响应式 */
export class GlobalStore {
	private static Store = new Map<keyof GlobalStoreData, GlobalStoreData>();

	/** 获取数据 */
	static readonly data: GlobalStoreData = new Proxy<GlobalStoreData>({} as GlobalStoreData, {
		get: (target, property) => {
			if (this.Store.has(property as keyof GlobalStoreData)) {
				return this.Store.get(property as keyof GlobalStoreData);
			}
			return void 0;
		},
	});

	/** 注册一条数据 */
	static commit<T extends keyof GlobalStoreData>(key: T, value: GlobalStoreData[T]) {
		// @ts-ignore
		this.Store.set(key, value);
	}

	constructor() {
		return new Error(`This class<GlobalStore> is a store for static datas, and it's not allowed to instantiate`);
	}
}
