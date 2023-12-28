import type { Ref } from 'vue';
import { ref, watchEffect } from 'vue';

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
	loading: Ref<boolean>;
	/** 页面内容是否渲染 */
	render: Ref<boolean>;
	/** 页面是否出错 */
	error: Ref<boolean>;
	/** 页面数据是否为空 */
	empty: Ref<boolean>;
	/** 页面是否显示 */
	show: Ref<boolean>;
}

type InitializeOptions = PickRequireType<PageRenderType, Ref<boolean>>;

type ChangeShowStateCallback = (options: InitializeOptions) => void;

/**
 * 页面渲染状态控制
 */
export function pageRender(
	initialize?: PickChangeType<Omit<InitializeOptions, 'show'>, boolean>,
	changeShowState?: ChangeShowStateCallback,
): PageRenderType {
	const render = ref(initialize?.render ?? false);
	const loading = ref(initialize?.loading ?? false);
	const error = ref(initialize?.error ?? false);
	const empty = ref(initialize?.empty ?? false);
	const show = ref(false);
	watchEffect(() => {
		const otherState = !loading.value && !error.value && !empty.value;
		if (typeof changeShowState !== 'undefined' && typeof changeShowState === 'function') {
			changeShowState({ render, loading, error, empty, show });
		} else {
			if (!show.value && render.value && otherState) {
				// 默认状态下show属性的侦听
				show.value = render.value;
			} else if (show.value && !render.value && !otherState) {
				show.value = render.value;
			}
		}
	});
	return new (class {
		get render() {
			return render;
		}
		get loading() {
			return loading;
		}
		get error() {
			return error;
		}
		get empty() {
			return empty;
		}
		get show() {
			return show;
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
