export type RequestConfig = Omit<UniApp.RequestOptions, 'method'> & {
	/**
	 * 请求频率限制，每秒的请求次数
	 */
	frequent?: number;

	/**
	 * `GET` 请求数据缓存时间，单位为毫秒，默认5000毫秒，为 -1 表示当前永久缓存
	 */
	cache?: number | boolean;

	/**
	 * 请求是否同步，同步情况下请求会通过队列请求，默认 `false`
	 */
	sync?: boolean;
};
