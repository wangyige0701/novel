const colors = {
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

const sizes = {
	base: {
		name: '基础',
		value: 'base',
	},
	sm: {
		name: '较小',
		value: 'sm',
	},
	xs: {
		name: '最小',
		value: 'xs',
	},
	lg: {
		name: '较大',
		value: 'lg',
	},
	xl: {
		name: '最大',
		value: 'xl',
	},
} as const;

// 背景色配置
export type ArticlebackgroundConfig = keyof typeof colors;

export const articlebackgroundConfig = Object.freeze(colors);

export const articlebackgroundConfigList = Object.keys(colors);

// 文字尺寸配置
export type ArticleSizeConfig = keyof typeof sizes;

export const articleSizeConfig = Object.freeze(sizes);

export const articleSizeConfigList = Object.keys(sizes);
