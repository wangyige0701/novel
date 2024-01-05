import { randomString } from '@/utils/random';

export const __ROOT_NAME__ = 'root/';

/** 进行vuex数据缓存的函数symbol */
export const __STORAGE__ = `__STORAGE__[${randomString()()}]`;

/** 缓存主键名 */
export const __STORAGE_KEY__ = '__VUEX__';
