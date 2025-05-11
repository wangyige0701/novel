import type { BookContentType } from '../interface/boos';

export type ReadingChapterInfo = Omit<BookContentType, 'id'>;
