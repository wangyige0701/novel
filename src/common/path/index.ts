import type { PathNavigateBack, PathNavigateTo, PathRedirectTo, PathReLaunch } from '@/@types/common/path';
import { callback, params } from './utils';

export class Path {
	/**
	 * 返回的页面数，如果 delta 大于现有页面数，则返回到首页
	 */
	static navigateBack(options?: PathNavigateBack) {
		return new Promise((resolve, reject) => {
			uni.navigateBack({
				animationType: 'pop-out',
				animationDuration: 200,
				...options,
				...callback(resolve, reject, options),
			});
		});
	}

	/**
	 * 需要跳转的应用内非 tabBar 的页面
	 */
	static navigateTo(url: string, options?: PathNavigateTo) {
		return new Promise((resolve, reject) => {
			uni.navigateTo({
				animationType: 'pop-in',
				animationDuration: 200,
				...options,
				url: params(url, options?.params),
				...callback(resolve, reject, options),
			});
		});
	}

	/**
	 * 需要跳转的应用内非 tabBar 的页面
	 */
	static redirectTo(url: string, options: PathRedirectTo) {
		return new Promise((resolve, reject) => {
			uni.redirectTo({
				...options,
				url: params(url, options?.params),
				...callback(resolve, reject, options),
			});
		});
	}

	/**
	 * 需要跳转的应用内页面, 如果跳转的页面路径是 tabBar 页面则不能带参数
	 */
	static reLaunch(url: string, options: PathReLaunch) {
		return new Promise((resolve, reject) => {
			uni.reLaunch({
				...options,
				url: params(url, options?.params),
				...callback(resolve, reject, options),
			});
		});
	}
}
