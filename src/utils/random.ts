/** 获取一个随机字符串 */
export function randomString() {
	const basicStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const basicStrLen = basicStr.length;
	return function () {
		return (Math.random() * Date.now())
			.toString(16)
			.replace(/\./g, basicStr.charAt(Math.floor(Math.random() * basicStrLen)));
	};
}
