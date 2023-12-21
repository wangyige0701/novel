import { defineConfig } from 'vite';
import uniPlugin from '@dcloudio/vite-plugin-uni';
import AutoImport from 'unplugin-auto-import/vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		uniPlugin(),
		AutoImport({
			imports: ['vue', 'vue-router', 'uni-app'],
			dts: './src/@types/auto-import.d.ts',
		}),
	],
});
