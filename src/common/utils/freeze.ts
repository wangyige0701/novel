/**
 * 冻结一个对象
 * @param obj
 * @param isFreeze 是否冻结
 * @returns
 */
export function toFreeze<T extends object>(obj: T, isFreeze: boolean): T {
	if (!isFreeze) {
		return obj;
	}
	return Object.freeze(obj);
}
