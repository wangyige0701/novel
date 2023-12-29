import type { Ref } from 'vue';
import { watchEffect } from 'vue';
import { explicitlyControlRef } from './getTrakTrigger';

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
 * 页面渲染状态控制
 */
export function pageRender(
	initialize?: Omit<InitializeOptions, 'show'>,
	changeShowState?: ChangeShowStateCallback,
): PageRenderType {
	const [render, _renderTrack, _renderTrigger] = explicitlyControlRef(initialize?.render ?? false);
	const [loading, _loadingTrack, _loadingTrigger] = explicitlyControlRef(initialize?.loading ?? false);
	const [error, _errorTrack, _errorTrigger] = explicitlyControlRef(initialize?.error ?? false);
	const [empty, _emptyTrack, _emptyTrigger] = explicitlyControlRef(initialize?.empty ?? false);
	const [show, _showTrack, _showTrigger] = explicitlyControlRef(false);
	/** 除了show以外的所有trigger函数触发 */
	function _trigger() {
		_renderTrigger();
		_loadingTrigger();
		_errorTrigger();
		_emptyTrigger();
	}
	function _track() {
		_renderTrack();
		_loadingTrack();
		_errorTrack();
		_emptyTrack();
		_showTrack();
	}
	const _watch = (() => {
		if (typeof changeShowState !== 'undefined' && typeof changeShowState === 'function') {
			return () => {
				changeShowState({ render, loading, error, empty, show });
				_trigger();
				_showTrigger();
			};
		} else {
			// 默认情况下只派发show的更新
			return () => {
				const otherState = !loading.value && !error.value && !empty.value;
				if (!show.value && render.value && otherState) {
					// 默认状态下show属性的侦听
					show.value = render.value;
					_showTrigger();
				} else if (show.value && !render.value && !otherState) {
					show.value = render.value;
					_showTrigger();
				}
			};
		}
	})();
	watchEffect(() => {
		_track();
		_watch();
	});
	return new (class {
		get render() {
			_renderTrack();
			return render.value;
		}
		get loading() {
			_loadingTrack();
			return loading.value;
		}
		get error() {
			_errorTrack();
			return error.value;
		}
		get empty() {
			_emptyTrack();
			return empty.value;
		}
		get show() {
			_showTrack();
			return show.value;
		}
		toLoad() {
			loading.value = true;
			render.value = false;
			error.value = false;
			empty.value = false;
			_trigger();
		}
		toRender() {
			loading.value = false;
			render.value = true;
			error.value = false;
			empty.value = false;
			_trigger();
		}
		toError() {
			loading.value = false;
			render.value = false;
			error.value = true;
			empty.value = false;
			_trigger();
		}
		toEmpty() {
			loading.value = false;
			render.value = false;
			error.value = false;
			empty.value = true;
			_trigger();
		}
		init() {
			loading.value = initialize?.loading ?? false;
			render.value = initialize?.render ?? false;
			error.value = initialize?.error ?? false;
			empty.value = initialize?.empty ?? false;
			_trigger();
		}
	})();
}
