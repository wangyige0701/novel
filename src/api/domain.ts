type ExtractInterfaceName<T extends object> = keyof T;

type ExtractInterfaceProperty<T extends object, K extends keyof T> = keyof T[K];

type InterfaceNames = ExtractInterfaceName<typeof interfaceInfo>;

type InterfaceProperties<T extends InterfaceNames> = ExtractInterfaceProperty<typeof interfaceInfo, T>;

/** 获取域名数据 */
export function getDomainInfo<T extends InterfaceNames, K extends InterfaceProperties<T>[]>(
	name: T,
	...values: K
): string {
	return values.reduce((prev, curr) => {
		return prev + interfaceInfo[name][curr];
	}, '');
}
