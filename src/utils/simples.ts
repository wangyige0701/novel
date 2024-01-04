/** 空函数 */
export const voidFunc = (...any: any[]): any => {};

/** 判断对象中有没有属性 */
export function hasProperty(obj: any, propName: string): boolean {
	return typeof obj === 'object' && obj !== null && obj.hasOwnProperty(propName);
}
