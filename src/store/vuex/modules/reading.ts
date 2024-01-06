import type { ResetModule } from '../@types';
import type { State, ReadingState, ReadingDirectionVariables } from '@/store';
import type { ArticlebackgroundConfig, ArticleSizeConfig } from '@comp/article/data/readStyle';
import { Reading } from '../variables/mutations';

export const reading: ResetModule<ReadingState, State> = {
	_storage: true,
	namespaced: true,
	state: {
		chapterCacheLength: 5,
		readingTheme: 'baixue',
		readingFontSize: 'base',
		readingDirection: 'vertical',
	},
	mutations: {
		[Reading.ChapterCacheLength](state, payload: number) {
			state.chapterCacheLength = payload;
		},
		[Reading.ReadingTheme](state, payload: ArticlebackgroundConfig) {
			state.readingTheme = payload;
		},
		[Reading.ReadingFontSize](state, payload: ArticleSizeConfig) {
			state.readingFontSize = payload;
		},
		[Reading.ReadingDirection](state, payload: ReadingDirectionVariables) {
			state.readingDirection = payload;
		},
	},
};
