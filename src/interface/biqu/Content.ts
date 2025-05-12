import type { IDType } from '@/@types';
import { chapter } from '@/api/biqu';
import { Content } from '@/interface/Content';
import { parseChapterHtml } from '@/parse/biqu';

export class BiquContent extends Content {
	protected async handleGetContent(chapterId: IDType) {
		const html = await chapter(chapterId)
			.then(res => res as string)
			.catch(() => '');
		return await parseChapterHtml(html);
	}
}
