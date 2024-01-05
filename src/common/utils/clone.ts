function _handleObj(obj: object) {
	return typeof obj === 'object' && obj !== null;
}

/** 判断是否在对象内部循环引用 */
export function checkCyclic(obj: any): boolean {
	if (!_handleObj(obj)) {
		return false;
	}
	const insertTarget = new WeakSet();
	function _deep(_o: any) {
		if (insertTarget.has(_o)) {
			return true;
		}
		insertTarget.add(_o);
		for (const key in _o) {
			const target = _o[key];
			if (_handleObj(target)) {
				const state = _deep(target);
				if (state === true) {
					return true;
				}
			}
		}
		insertTarget.delete(_o);
		return false;
	}
	return _deep(obj);
}

/**
 * 深度克隆
 * @param obj 克隆的对象
 * @param cyclic 是否允许循环引用，默认false不允许
 * @returns
 */
export function deepClone(obj: object, cyclic: boolean = false) {
	if (!cyclic && checkCyclic(obj)) {
		throw new Error('对象循环引用');
	}
	/** 循环检测 */
	const deepCache = new WeakMap();
	function _clone(obj: object) {
		if (!_handleObj(obj)) {
			return obj;
		}
		const cache = deepCache.get(obj);
		if (cache) {
			return cache;
		}
		let cloneObj: any = Array.isArray(obj) ? [] : {};
		// 原型一致
		Object.setPrototypeOf(cloneObj, Object.getPrototypeOf(obj));
		deepCache.set(obj, cloneObj);
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				cloneObj[key] = _clone(obj[key as keyof typeof obj]);
			}
		}
		deepCache.delete(obj);
		return cloneObj;
	}
	return _clone(obj);
}
