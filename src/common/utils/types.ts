export function isString(value: any): value is string {
	return typeof value === 'string';
}

export function isNumber(value: any): value is number {
	return typeof value === 'number';
}

export function isBoolean(value: any): value is boolean {
	return typeof value === 'boolean';
}

export function isUndefined(value: any): value is undefined {
	return typeof value === 'undefined';
}

export function isNull(value: any): value is null {
	return value === null;
}

export function isFunction(value: any): value is Function {
	return typeof value === 'function';
}

export function isArray(value: any): value is any[] {
	return Array.isArray(value);
}

export function isObject(value: any): value is { [key: string | number | symbol]: any } {
	return !isNull(value) && !isArray(value) && typeof value === 'object';
}

export function isGeneralObject(value: any): value is object {
	return !isNull(value) && typeof value === 'object';
}

export function isBigint(value: any): value is bigint {
	return typeof value === 'bigint';
}

export function isSymbol(value: any): value is symbol {
	return typeof value === 'symbol';
}

export function isDate(value: any): value is Date {
	return value instanceof Date;
}

export function isRegExp(value: any): value is RegExp {
	return value instanceof RegExp;
}
