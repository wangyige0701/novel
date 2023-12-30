const obj = {
	baixue: {
		name: '白雪',
		value: 'baixue',
	},
	huilv: {
		name: '灰绿',
		value: 'huilv',
	},
	qianlan: {
		name: '浅蓝',
		value: 'qianlan',
	},
	minghuang: {
		name: '明黄',
		value: 'minghuang',
	},
	danlv: {
		name: '淡绿',
		value: 'danlv',
	},
	caolv: {
		name: '草绿',
		value: 'caolv',
	},
	hongfen: {
		name: '红粉',
		value: 'hongfen',
	},
	fangmoshui: {
		name: '仿墨水屏',
		value: 'fangmoshui',
	},
	mihuang: {
		name: '米黄',
		value: 'mihuang',
	},
	cha: {
		name: '茶色',
		value: 'cha',
	},
	yin: {
		name: '银色',
		value: 'yin',
	},
	heilv: {
		name: '黑绿',
		value: 'heilv',
	},
	qianhuang: {
		name: '浅黄',
		value: 'qianhuang',
	},
	wuye: {
		name: '午夜',
		value: 'wuye',
	},
	qianhui: {
		name: '浅灰',
		value: 'qianhui',
	},
	qihei: {
		name: '漆黑',
		value: 'qihei',
	},
} as const;

export type ReadStyleConfig = keyof typeof obj;

export const readStyleConfig = Object.freeze(obj);

export const readStyleConfigList = Object.keys(obj);
