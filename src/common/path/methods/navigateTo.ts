import type { OptionsParams } from '../main';
import { optionsArrange } from '../main';

/**
 * 保留当前页面，跳转到应用内的某个页面
 * @param options
 * @returns
 */
export function navigateTo(
	options: UniApp.NavigateToOptions & OptionsParams,
): Promise<UniApp.NavigateToSuccessOptions> {
	return new Promise((resolve, reject) => {
		uni.navigateTo(optionsArrange(resolve, reject, 'nagivateTo', options));
	});
}
