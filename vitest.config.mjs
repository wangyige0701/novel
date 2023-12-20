import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.test.mjs';

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			name: 'main-test',
			root: './test/run',
			alias: {
				'@/': new URL('./src/', import.meta.url).pathname,
			},
		},
	}),
);
