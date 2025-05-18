import { ShallowReactive, watch } from 'vue';
import { useBookshelf } from '@/store/bookshelf';
import type { Bookshelf as B } from '@/@types/interface/bookshelf';
import { Fn, VOID_FUNCTION } from '@wang-yige/utils';
import type { Chapter } from '@/interface/Chapter';

type V = {
	loading: boolean;
	title: string;
	contents: string[];
	prev: Fn<[], Promise<void>>;
	next: Fn<[], Promise<void>>;
};

export async function getReading() {
	let chapter: Chapter | undefined;
	const data = shallowReactive<V>({
		loading: false,
		title: '',
		contents: shallowReactive([]),
		prev: async () => {
			chapter && (await chapter.getPrev());
		},
		next: async () => {
			chapter && (await chapter.getNext());
		},
	});
	data.loading = true;
	chapter = await getReadingContent(useBookshelf().current, data);
	data.loading = false;

	const closeWatch = watch(
		() => useBookshelf().current,
		async newValue => {
			data.loading = true;
			chapter = await getReadingContent(newValue, data);
			data.loading = false;
		},
	);

	return {
		data,
		closeWatch,
	};
}

async function getReadingContent(Bookshelf: B, data: ShallowReactive<V>) {
	const book = Bookshelf.book;
	if (!book) {
		return;
	}
	const chapter = book.chapter;
	await chapter.init().catch(VOID_FUNCTION);
	const content = chapter.content;
	if (!content) {
		return;
	}
	data.title = content.title;
	data.contents.splice(0, data.contents.length, ...content.contents);
	return chapter;
}
