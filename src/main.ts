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

export function createApp() {
	const app = createSSRApp(App);
	app.use(createPinia());

	const infoStore = useInfoStore();
	if (uni && isFunction(uni.getSystemInfoSync)) {
		infoStore.set('statusBarHeight', uni.getSystemInfoSync().statusBarHeight ?? 0);
	}

	// 设备信息
	const deviceInfo = uni.getDeviceInfo();
	for (const key in deviceInfo) {
		infoStore.set(key as keyof DeviceInfoResult, deviceInfo[key as keyof DeviceInfoResult]);
	}

	// 默认的数据请求节点
	const searchProxyStore = useSearchProxyStore();
	searchProxyStore.switch('dingdian');

	return {
		app,
	};
}
