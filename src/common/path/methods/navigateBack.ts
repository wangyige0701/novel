import { optionsArrange } from './main';

/**
 * 关闭当前页面，返回一或多级页面
 * @param options
 * @returns
 */
export function navigateBack(options?: UniApp.NavigateBackOptions): Promise<any> {
	return new Promise((resolve, reject) => {
		if (options) {
			uni.navigateBack(optionsArrange(resolve, reject, 'nagivateBack', options));
		} else {
			uni.navigateBack({
				success: resolve,
				fail: reject,
			});
		}
	});
}
