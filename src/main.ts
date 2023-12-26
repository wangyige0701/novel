import { createSSRApp } from 'vue';
import App from './App.vue';

export function createApp() {
	const app = createSSRApp(App);

	let statusBarHeight = 0;
	if (uni && uni.getSystemInfoSync) {
		statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0;
	}
	app.provide('statusBarHeight', statusBarHeight);

	return {
		app,
	};
}
