import type { HTMLParseTag } from '@/core/@types/parse';

/**
 * 列表数据
 */
export type ListTarget = {
	name: HTMLParseTag | undefined;
	author: HTMLParseTag | undefined;
};

/**
 * 列表数据处理返回类型
 */
export type ListReturnVal = { name: string; author: string; href: string };
