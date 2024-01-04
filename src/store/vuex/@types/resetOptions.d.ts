import type { StoreOptions, ModuleTree, Module } from 'vuex';

interface Storage {
	/** 自定义vuex配置项，判断是否将此层级下的state数据写入缓存，如果传入字符串数组，则只写入数组内的属性 */
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
