import type { ArticlebackgroundConfig, ArticleSizeConfig } from '@comp/article/data/readStyle';
import { Store } from 'vuex';

export interface ReadingState {
	/** 章节缓存的长度 */
	chapterCacheLength: number;
	/** 阅读页面主题 */
	readingTheme: ArticlebackgroundConfig;
	/** 阅读页面字号 */
	readingFontSize: ArticleSizeConfig;
}

export interface State {
	// 阅读器配置
	reading: ReadingState;
}

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$store: Store<State>;
	}
}
