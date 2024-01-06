import { isObject } from './types';

/** 比较数据不同，为true表示数据相同，否则不同 */
export function compareIsSame(newValue: any, oldValue: any) {
	if (newValue === oldValue) {
		return true;
	}
	if (!isObject(newValue) || !isObject(oldValue)) {
		return false;
	}
	for (const key in newValue) {
		if (!oldValue || !oldValue.hasOwnProperty(key) || newValue[key] !== oldValue[key]) {
			return false;
		}
	}
	return true;
}
