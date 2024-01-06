/** watch模式中立即执行的配置对象 */
export const immediate: {
	immediate: true;
} = Object.defineProperty(
	{
		immediate: true,
	},
	'immediate',
	{
		value: true,
		enumerable: true,
		configurable: false,
		writable: false,
	},
);
