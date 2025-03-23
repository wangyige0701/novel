import { IDType } from '..';

/**
 * 单本书信息
 */
export interface BookItemInfo {
	id: IDType;
	name: string;
	img: string;
	author: string;
	description: string;
}
