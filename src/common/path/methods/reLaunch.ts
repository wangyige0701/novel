import type { OptionsParams } from '../main';
import { optionsArrange } from '../main';

/**
 * 关闭所有页面，打开到应用内的某个页面。
 * @param options
 * @returns
 */
export function reLaunch(options: UniApp.ReLaunchOptions & OptionsParams): Promise<any> {
	return new Promise((resolve, reject) => {
		uni.reLaunch(optionsArrange(resolve, reject, 'reLaunch', options));
	});
}
