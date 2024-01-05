import { ConfigTarget } from '../../../config/data'; // 注：此文件需要被vite.config.ts引用，所以不能使用路径别名

export default {
	test: ConfigTarget.test.domain,
	dingdian: ConfigTarget.dingdian.domain,
};
