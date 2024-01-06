export const MutationsPositon = Symbol('MutationsPositon');

class Base {
	[MutationsPositon]() {}
}

/** reading模块state属性 */
export class Reading extends Base {
	static ChapterCacheLength = 'chapterCacheLength';
	static ReadingTheme = 'readingTheme';
	static ReadingFontSize = 'readingFontSize';
	static ReadingDirection = 'readingDirection';
}
