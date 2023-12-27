import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import path from 'path';
import uniPlugin from '@dcloudio/vite-plugin-uni';
import AutoImport from 'unplugin-auto-import/vite';

function createPages() {
	return <Plugin>{
		name: 'createPages',
		buildStart() {
			console.log('buildStart');
		},
	};
}

/**
 * 获取teconfig中的重定向配置
 * @returns
 */
function getAllAlias() {
	const value = require('./tsconfig.json').compilerOptions.paths;
	const result = {};
	const match = /^(@?.*)[\/\\]\*$/;
	function _r(str: string) {
		return str.match(match)?.[1] || '';
	}
	for (const key in value) {
		const valueKey = key.match(match)?.[1] || '@';
		const valueTarget = value[key];
		let target: string[] = [];
		if (!Array.isArray(valueTarget)) {
			target.push(_r(valueTarget));
		} else if (Array.isArray(valueTarget) && valueTarget.length > 0) {
			for (const item of valueTarget) {
				target.push(_r(item));
			}
		}
		if (target.length > 0) {
			result[valueKey] = target.map(item => {
				return path.resolve(__dirname, item);
			});
		}
	}
	return result;
}

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			...getAllAlias(),
		},
	},
	build: {
		rollupOptions: {
			external: ['uni'],
		},
	},
	plugins: [
		createPages(),
		uniPlugin(),
		AutoImport({
			imports: ['vue', 'vue-router', 'uni-app'],
			dts: './src/@types/auto-import.d.ts',
		}),
	],
});
