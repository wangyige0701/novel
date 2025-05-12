import { Book } from '@/interface/Book';
import { BiquChapter } from './Chapter';

export class BiquBook extends Book {
	protected bindChapter() {
		return BiquChapter;
	}
}
