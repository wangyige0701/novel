import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
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

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		createPages(),
		uniPlugin(),
		AutoImport({
			imports: ['vue', 'vue-router', 'uni-app'],
			dts: './src/@types/auto-import.d.ts',
		}),
	],
});
