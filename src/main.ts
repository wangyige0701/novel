import { createSSRApp } from 'vue';
import { GlobalStore } from '@/config/store';
import App from './App.vue';

export function createApp() {
	const app = createSSRApp(App);

	// 注册状态栏高度数据
	let statusBarHeight = 0;
	if (uni && uni.getSystemInfoSync) {
		statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0;
	}
	GlobalStore.commit('statusBarHeight', statusBarHeight);

	// 注册设备信息
	const deviceInfo: UniApp.GetDeviceInfoResult = uni.getDeviceInfo();
	for (const key in deviceInfo) {
		if (key === 'model' || key === 'brand') {
			continue;
		}
		GlobalStore.commit(
			key as keyof Omit<UniApp.GetDeviceInfoResult, 'brand' | 'model'>,
			deviceInfo[key as keyof UniApp.GetDeviceInfoResult],
		);
	}

	return {
		app,
	};
}
