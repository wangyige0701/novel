import type { Awaitable, Fn, PromiseReject, PromiseResolve } from '@wang-yige/utils';
import type { Component } from 'vue';

export type InteractUses = 'modal' | 'tip' | 'popup' | 'loading';

type InteractButton = {
	confirmButtonText?: string;
	cancelButtonText?: string;
	ok?: Fn<[any], any>;
	cancel?: Fn<[any], any>;
};

export type InteractExtend = {
	/** 组件可见状态 */
	visible: boolean;
	/** 可见状态过渡时长 */
	transitionDuration: number;
	transitionTimingFunction: 'ease' | 'linear' | 'ease-in' | 'ease-in-out' | 'ease-out' | 'step-start' | 'step-end';
	resolve: PromiseResolve<void>;
	reject: PromiseReject;
	close: Fn;
};

export type InteractMask = {
	/** 是否显示遮罩层，默认 `true` */
	mask?: boolean;
	/** 遮罩层背景色 */
	maskBgColor?: string;
	/** 是否点击遮罩层关闭 */
	maskClosable?: boolean;
};

export type InteractMaskProps = InteractMask & {
	/** 关闭遮罩层的函数 */
	closeMask: Fn<[], any>;
	zIndex: number;
	/** 可见状态，用于执行动画 */
	visible?: boolean;
	/** 动画时间 */
	duration?: number;
};

/**
 * 模态框组件属性
 */
export type InteractModalProps = {
	/** 标题，默认 `提示` */
	title?: string;
	message?: string;
	component?: Component;
	/** 是否隐藏 title，默认 `false` */
	hideTitle?: boolean;
	/**
	 * 确认时的回调，如果传入 promise 则会等待 promise 完成
	 */
	onOk?: Fn<[], Awaitable<any>>;
	onCancel?: Fn;
} & InteractMask &
	InteractButton;

/**
 * 弹出层组件属性
 */
export type InteractPopupProps = {
	/** 弹层位置，默认 `bottom` */
	direction?: 'left' | 'right' | 'top' | 'bottom' | 'center';
	/** 是否显示关闭按钮，`button` 属性为 true 则不会显示 */
	closeIcon?: boolean;
	/** 关闭按钮位置，默认 `top-right` */
	closePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
	/** 是否显示交互按钮，默认 `true` */
	button?: boolean;
	/** 按钮位置，默认 `top` */
	buttonPostion?: 'top' | 'bottom';
	/** 弹出层的标题，可以不设置 */
	title?: string;
	component?: Component;
	beforeClose?: Fn<[], Awaitable<any>>;
} & InteractMask &
	InteractButton;

export type InteractTipProps = {
	/** 提示内容 */
	message: string;
	position?: 'top' | 'bottom' | 'center' | 'stick-top' | 'stick-bottom';
	type: 'success' | 'warning' | 'error' | 'info';
};

export type InteractLoadingProps = {
	text?: string;
	duration?: number;
};
