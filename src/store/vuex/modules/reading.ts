import type { ResetModule } from '../@types';
import type { State, ReadingState } from '@/store';

export const reading: ResetModule<ReadingState, State> = {
	_storage: true,
	namespaced: true,
	state: {
		chapterCacheLength: 5,
		readingTheme: 'baixue',
		readingFontSize: 'base',
	},
	mutations: {
		test(state) {
			state.chapterCacheLength = 10;
		},
	},
};
