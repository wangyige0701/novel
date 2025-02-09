import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import AutoImport from 'unplugin-auto-import/vite';
import ProxyConfig from './src/config/proxy';
import { autoCreateAliasConfig } from './vite/alias';
import { autoCreateProxyConfig } from './vite/proxy';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		uni(),
		AutoImport({
			imports: ['vue', 'vue-router', 'uni-app'],
			dts: './src/@types/auto-import.d.ts',
		}),
	],
	build: {
		rollupOptions: {
			external: ['uni'],
		},
	},
	server: {
		port: ProxyConfig.port,
		proxy: autoCreateProxyConfig(),
	},
	resolve: {
		alias: autoCreateAliasConfig('./tsconfig.json'),
	},
});
