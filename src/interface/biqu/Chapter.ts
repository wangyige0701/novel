import type { IDType } from '@/@types';
import { book } from '@/api/biqu';
import { Chapter } from '@/interface/Chapter';
import { parseBookChaptersHtml } from '@/parse/biqu';
import { BiquContent } from './Content';

export class BiquChapter extends Chapter {
	protected async handleGetChapters(bookId: IDType) {
		const html = await book(bookId)
			.then(res => res as string)
			.catch(() => '');
		return await parseBookChaptersHtml(html);
	}

	protected bindContent() {
		return BiquContent;
	}
}
