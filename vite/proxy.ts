import type { ProxyOptions } from 'vite';
import { searchProxy } from '../src/api/proxy';
import ProxyConfig from '../src/config/proxy';

/**
 * 自动生成代理配置
 */
export function autoCreateProxyConfig() {
	if (process.env.UNI_PLATFORM !== 'h5') {
		// 非h5环境不使用代理
		return {};
	}
	const keys = Object.keys(searchProxy);
	return keys.reduce(
		(prev, curr) => {
			const config = searchProxy[curr as keyof SearchProxy];
			const alias = config.alias;
			const domain = config.domain;
			prev[`/${alias}`] = {
				// 转发路径需要判断是否是本地代理
				target: config.local ? `${ProxyConfig.domain}:${ProxyConfig.port}/${alias}` : domain,
				changeOrigin: true,
				rewrite: (path: string) => path.replace(new RegExp(`^/${alias}`), ''),
			};
			return prev;
		},
		{} as Record<string, ProxyOptions>,
	);
}
