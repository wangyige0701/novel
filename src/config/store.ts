interface UniappDeciceInfo extends UniApp.GetDeviceInfoResult {}

interface GlobalStoreData extends Omit<UniappDeciceInfo, 'model' | 'brand'> {
	/** 状态栏高度 */
	statusBarHeight: number;
}

/** 注册全局储存数据 */
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
}
