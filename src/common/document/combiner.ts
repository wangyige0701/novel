/**
 * 组合器
 */
export enum Combiner {
	/**
	 * 后代组合器
	 * @example
	 * ```css
	 * a b {}
	 * ```
	 * 代表
	 * ```html
	 * <a>
	 * 	...
	 * 	 <b><!-- this --></b>
	 * </a>
	 * ```
	 */
	DESCENDANT = 1,
	/**
	 * 子元素组合器
	 * @example
	 * ```css
	 * a > b {}
	 * ```
	 * 代表
	 * ```html
	 * <a>
	 * 	<b><!-- this --></b>
	 * </a>
	 * ```
	 */
	CHILD = 2,
	/**
	 * 接续兄弟组合器
	 * @example
	 * ```css
	 * a + b {}
	 * ```
	 * 代表
	 * ```html
	 * <div>
	 * 	<a></a>
	 * 	<b><!-- this --></b>
	 * 	<b></b>
	 * </div>
	 * ```
	 */
	NEXT_SIBLING = 3,
	/**
	 * 后代兄弟组合器
	 * @example
	 * ```css
	 * a ~ b {}
	 * ```
	 * 代表
	 * ```html
	 * <div>
	 * 	<a></a>
	 * 	<b><!-- this --></b>
	 * 	<c></c>
	 * 	<b><!-- this --></b>
	 * </div>
	 * ```
	 */
	SUBSEQUENT_SIBLING = 4,
}
