import type { Ref } from 'vue';
import { watchEffect } from 'vue';

interface PageRenderType {
	/** 状态改为加载 */
	toLoad: Function;
	/** 状态改为渲染 */
	toRender: Function;
	/** 状态改为出错 */
	toError: Function;
	/** 状态改为空数据 */
	toEmpty: Function;
	/** 数据初始化 */
	init: Function;
	/** 页面是否在加载 */
	loading: boolean;
	/** 页面内容是否渲染 */
	render: boolean;
	/** 页面是否出错 */
	error: boolean;
	/** 页面数据是否为空 */
	empty: boolean;
	/** 页面是否显示 */
	show: boolean;
}

/** 获取所有boolean类型 */
type InitializeOptions = PickRequireType<PageRenderType, boolean>;

/** 修改show属性显示逻辑的回调 */
type ChangeShowStateCallback = (options: PickChangeType<InitializeOptions, Ref<boolean>>) => void;

/**
 * 页面渲染状态控制，自定义ref控制依赖收集
 */
export function pageRender(
	initialize?: Omit<InitializeOptions, 'show'>,
	changeShowState?: ChangeShowStateCallback,
): PageRenderType {
	const render = ref(initialize?.render ?? false);
	const loading = ref(initialize?.loading ?? false);
	const error = ref(initialize?.error ?? false);
	const empty = ref(initialize?.empty ?? false);
	const show = ref(false);
	const _watch = (() => {
		if (typeof changeShowState !== 'undefined' && typeof changeShowState === 'function') {
			return () => {
				changeShowState({ render, loading, error, empty, show });
			};
		} else {
			// 默认情况下只派发show的更新
			return () => {
				const otherState = !loading.value && !error.value && !empty.value;
				if (!show.value && render.value && otherState) {
					// 默认状态下show属性的侦听
					show.value = render.value;
				} else if (show.value && !render.value && !otherState) {
					show.value = render.value;
				}
			};
		}
	})();
	watchEffect(() => {
		show.value;
		_watch();
	});
	return new (class {
		get render() {
			return render.value;
		}
		get loading() {
			return loading.value;
		}
		get error() {
			return error.value;
		}
		get empty() {
			return empty.value;
		}
		get show() {
			return show.value;
		}
		toLoad() {
			loading.value = true;
			render.value = false;
			error.value = false;
			empty.value = false;
		}
		toRender() {
			loading.value = false;
			render.value = true;
			error.value = false;
			empty.value = false;
		}
		toError() {
			loading.value = false;
			render.value = false;
			error.value = true;
			empty.value = false;
		}
		toEmpty() {
			loading.value = false;
			render.value = false;
			error.value = false;
			empty.value = true;
		}
		init() {
			loading.value = initialize?.loading ?? false;
			render.value = initialize?.render ?? false;
			error.value = initialize?.error ?? false;
			empty.value = initialize?.empty ?? false;
		}
	})();
}
