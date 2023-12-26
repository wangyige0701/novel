import { ConfigTarget, ConfigSelect } from './data';

export { ConfigTarget, ConfigSelect };

type ExtractInterfaceName<T extends object> = keyof T;

type ExtractInterfaceProperty<T extends object, K extends keyof T> = keyof T[K];

type InterfaceNames = ExtractInterfaceName<typeof ConfigTarget>;

type InterfaceProperties<T extends InterfaceNames> = ExtractInterfaceProperty<typeof ConfigTarget, T>;

const endOfSlash = /^[\w\W]*[\\\/]+$/;

const startOfSlash = /^[\\\/]+([\w\W]*)$/;

/**
 * 去除多余斜杠
 * @param font
 * @param back
 * @returns
 */
function _removeSlash(font: string, back: string) {
	if (endOfSlash.test(font) && startOfSlash.test(back)) {
		return [font, back.match(startOfSlash)![1]];
	}
	return [font, back];
}

/**
 * 获取接口配置中存在的属性数据
 * @param name
 * @param values
 * @returns
 */
export function getInterfaceData<T extends InterfaceNames, K extends InterfaceProperties<T>[]>(
	name: T,
	...values: K
): string {
	return values.reduce((prev, curr) => {
		let val: string = ConfigTarget[name][curr] as string;
		[prev, val] = _removeSlash(prev, val);
		return prev + val;
	}, '');
}

/**
 * 根据默认域名信息获取对应接口配置数据
 * @param values
 * @returns
 */
export function getInterfaceDataDefault<K extends InterfaceProperties<typeof ConfigSelect.TARGET>[]>(
	...values: K
): string {
	return getInterfaceData(ConfigSelect.TARGET, ...values);
}

/**
 * 域名数据拼接任意字符串
 * @param values
 * @returns
 */
export function mergeWithDomain<T extends InterfaceNames>(name: T, ...values: string[]): string {
	return values.reduce((prev, curr) => {
		[prev, curr] = _removeSlash(prev, curr);
		return prev + curr;
	}, ConfigTarget[name].domain as string);
}

/**
 * 配置中默认的域名拼接任意字符串
 * @param values
 * @returns
 */
export function mergeWithDomainDefault(...values: string[]): string {
	return mergeWithDomain(ConfigSelect.TARGET, ...values);
}
