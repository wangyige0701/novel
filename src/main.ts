import '@/style/icon.scss';
import '@/style/animation.scss';
import '@/style/common.scss';

import type { DeviceInfoResult } from '@/@types/store/info';
import { createSSRApp } from 'vue';
import { createPinia } from 'pinia';
import { isFunction } from '@wang-yige/utils';
import { useInfoStore } from '@/store/info';
import { useSearchProxyStore } from '@/store/proxy';
import App from './App.vue';
import { SearchProxyKeys } from './api/proxy';

// @ts-expect-error 添加 Buffer api，并禁止使用 Buffer
globalThis.Buffer = Object.defineProperty(class {}, 'isBuffer', {
	writable: false,
	configurable: false,
	value: function (_obj: any) {
		return false;
	},
});

export function createApp() {
	const app = createSSRApp(App);
	app.use(createPinia());

	const infoStore = useInfoStore();
	// app 环境设置状态栏高度
	if (uni && isFunction(uni.getSystemInfoSync)) {
		infoStore.set('statusBarHeight', uni.getSystemInfoSync().statusBarHeight ?? 0);
	}
	// 设备信息
	for (const [key, value] of Object.entries(uni.getDeviceInfo())) {
		infoStore.set(key as keyof DeviceInfoResult, value);
	}

	// 加载数据库
	loadDatabase();

	// 默认的数据请求节点
	useSearchProxyStore().switch(SearchProxyKeys.biqu);

	return {
		app,
	};
}
