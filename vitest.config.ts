import { defineConfig, mergeConfig } from 'vitest/config';
import { defineConfig as viteDefineConfig } from 'vite';
import viteConfig from './vite.config';

export default mergeConfig(
	viteDefineConfig({
		resolve: {
			...viteConfig.resolve,
		},
	}),
	defineConfig({
		test: {
			name: 'node',
			environment: 'node',
			include: ['src/test/**/*.test.ts'],
			testTimeout: 30000,
		},
	}),
);
