import type { Alias } from 'vite';
import path from 'node:path';
import fs from 'node:fs';

/**
 * 自动创建tsconfig alias路径别名配置
 * @param url tsconfig.json路径，默认为项目根目录
 */
export function autoCreateAliasConfig(url: string): Alias[] {
	url = path.resolve(process.cwd(), url);
	if (!url.endsWith('.json') || !fs.existsSync(url)) {
		throw new Error('请传入正确的tsconfig.json路径');
	}
	const json = JSON.parse(fs.readFileSync(url, 'utf-8'));
	const configs = json.compilerOptions?.paths;
	const baseUrl = json.compilerOptions?.baseUrl ?? './';
	if (!configs) {
		return [];
	}
	const result: Alias[] = [];
	const match = /(?:^(@?.*)[/\\]\*$)|(?:^(@?.*[^\\/][^@])$)/;
	function _parse(str: string, _default: string = '') {
		const r = str.match(match);
		if (!r) {
			return '';
		}
		return r[1] || r[2] || _default;
	}
	for (const key in configs) {
		// tsconfig.json中配置的路径别名
		const valueKey = _parse(key, '@');
		const valueTarget = configs[key];
		const target: string[] = [];
		if (!Array.isArray(valueTarget)) {
			throw new Error(`请检查 ${url} 中 paths 配置`);
		} else if (valueTarget.length > 0) {
			for (const item of valueTarget) {
				target.push(_parse(item));
			}
		} else {
			continue;
		}
		if (target.length > 0) {
			for (const item of target) {
				const _url = path.resolve(url, '..', baseUrl, item);
				if (!fs.existsSync(_url)) {
					throw new Error(`请检查 ${url} 中 paths 配置，${item} 不存在`);
				}
				result.push({
					find: valueKey,
					replacement: _url,
				});
			}
		}
	}
	return result as Alias[];
}
