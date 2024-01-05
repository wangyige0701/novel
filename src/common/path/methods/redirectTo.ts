import type { OptionsParams } from './main';
import { optionsArrange } from './main';

/**
 * 关闭当前页面，跳转到应用内的某个页面
 * @param options
 * @returns
 */
export function redirectTo(options: UniApp.RedirectToOptions & OptionsParams): Promise<any> {
	return new Promise((resolve, reject) => {
		uni.redirectTo(optionsArrange(resolve, reject, 'redirectTo', options));
	});
}
