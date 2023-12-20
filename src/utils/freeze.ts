export function toFreeze<T extends object>(obj: T, isFreeze: boolean): T {
	if (!isFreeze) {
		return obj;
	}
	return Object.freeze(obj);
}
