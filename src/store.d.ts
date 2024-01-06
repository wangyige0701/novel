import type { ArticlebackgroundConfig, ArticleSizeConfig } from '@comp/article/data/readStyle';
import { Store } from 'vuex';

/** 阅读方向变量 */
export type ReadingDirectionVariables = 'vertical' | 'horizontal';

export interface ReadingState {
	/** 章节缓存的长度 */
	chapterCacheLength: number;
	/** 阅读页面主题 */
	readingTheme: ArticlebackgroundConfig;
	/** 阅读页面字号 */
	readingFontSize: ArticleSizeConfig;
	/** 阅读方向 */
	readingDirection: ReadingDirectionVariables;
}

export interface State {}

/** 包含所有模块类型的类型接口 */
export interface ModulesState extends State {
	// 阅读器配置
	reading: ReadingState;
}

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$store: Store<ModulesState>;
	}
}
