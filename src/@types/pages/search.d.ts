import { BookItemInfo } from '.';

export type SearchBookInfo = Omit<BookItemInfo, 'id'>;
