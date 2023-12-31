const basicStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const basicStrLen = basicStr.length;

export function randomString() {
	return (Math.random() + Date.now())
		.toString(16)
		.replace(/./g, basicStr.charAt(Math.floor(Math.random() * basicStrLen)));
}
