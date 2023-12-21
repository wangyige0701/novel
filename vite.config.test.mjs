import { defineConfig } from 'vite';
import AutoImport from 'unplugin-auto-import/vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		AutoImport({
			imports: ['vue'],
			dts: './src/@types/auto-import.d.ts',
		}),
	],
});
