import type { StoreOptions, Module } from 'vuex';

interface Storage {
	/**
	 * 自定义vuex配置项，判断是否将此层级下的state数据写入缓存，如果传入字符串数组，则只写入数组内的属性，
	 * 如果配置了`_storage`，则`namespaced`属性会被自动设置为true
	 */
	_storage?: boolean | string[];
}

type InjectStorage<T extends object> = T & Storage;

type Replace<T, K, O> = {
	[P in keyof T]: P extends K ? O : T[P];
};

export type ResetModule<S, R> = Replace<InjectStorage<Module<S, R>>, 'modules', ResetModuleTree<R>>;

export type ResetModuleTree<R> = {
	[key: string]: ResetModule<any, R>;
};

export type ResetStoreOptions<S> = Replace<InjectStorage<StoreOptions<S>>, 'modules', ResetModuleTree<S>>;

export interface PathMapValue {
	filter: string[];
	/** getter注册的命名空间 */
	getterPath: string;
}

/** 更新后返回给缓存调用函数的格式 */
export interface RefreshStateDatas {
	key: string;
	data: any;
}

// 设置缓存的函数
export type SettingStorageCallback = (path: string, datas: RefreshStateDatas[]) => any;
