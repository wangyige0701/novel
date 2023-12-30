import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import path from 'path';
import uniPlugin from '@dcloudio/vite-plugin-uni';
import AutoImport from 'unplugin-auto-import/vite';
import ProxyConfig from './src/request/proxy';

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
function createAliasConfig() {
	const value = require('./tsconfig.json').compilerOptions.paths;
	const result = {};
	const match = /(?:^(@?.*)[\/\\]\*$)|(?:^(@?.*[^\\\/][^@])$)/;
	function _r(str: string, _default: string = '') {
		const r = str.match(match);
		if (!r) {
			return '';
		}
		return r[1] || r[2] || _default;
	}
	for (const key in value) {
		const valueKey = _r(key, '@');
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

/**
 * h5环境下根据代理配置生成对象
 * @returns
 */
function createProxyConfig() {
	const keys = Object.keys(ProxyConfig);
	const result = keys.reduce((prev, curr) => {
		prev[`/${curr}`] = {
			target: `${ProxyConfig[curr]}/`,
			// target: `http://127.0.0.1:7012/${curr}`, // nginx代理
			changeOrigin: true,
			rewrite: (path: string) => path.replace(new RegExp(`^/${curr}`), ''),
		};
		return prev;
	}, {});
	return result;
}

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			...createAliasConfig(),
		},
	},
	server: {
		proxy:
			process.env.UNI_PLATFORM === 'h5'
				? {
						...createProxyConfig(),
					}
				: {},
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
