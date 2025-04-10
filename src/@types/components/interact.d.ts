import type { Awaitable, Fn, PromiseReject, PromiseResolve } from '@wang-yige/utils';
import type { Component } from 'vue';
import type { GetProps } from '@/@types/index';
import type { CloseTypes } from '@/config/interact';

export type InteractUses = 'modal' | 'tip' | 'popup' | 'loading';

type InteractButton = {
	confirmButtonText?: string;
	cancelButtonText?: string;
	/** 确认时的回调，如果传入 promise 则会等待 promise 完成  */
	onOk?: Fn<[], Awaitable<any>>;
	onCancel?: Fn;
};

export type InteractResolve = {
	type: CloseTypes;
} & Record<string, any>;

export type InteractExtend = {
	/** 组件可见状态 */
	visible: boolean;
	/** 可见状态过渡时长 */
	transitionDuration: number;
	transitionTimingFunction: 'ease' | 'linear' | 'ease-in' | 'ease-in-out' | 'ease-out' | 'step-start' | 'step-end';
	resolve: PromiseResolve<InteractResolve>;
	reject: PromiseReject;
	close: Fn;
	lock: boolean; // 是否锁定关闭行为
};

export type InteractExtendEmit = {
	(event: 'update:lock', value: boolean): void;
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
export type InteractModalProps<T = Component> = {
	/** 标题，默认 `提示` */
	title?: string;
	message?: string;
	component?: T;
	componentProps?: GetProps<T>;
	/** 是否隐藏 title，默认 `false` */
	hideTitle?: boolean;
} & InteractMask &
	InteractButton;

/**
 * 弹出层组件属性
 */
export type InteractPopupProps<T = Component> = {
	/** 弹层位置，默认 `bottom` */
	direction?: 'left' | 'right' | 'top' | 'bottom' | 'center';
	/** 是否显示关闭按钮，`button` 属性为 true 则不会显示 */
	closeIcon?: boolean;
	/** 关闭按钮位置，默认 `top-right` */
	closePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
	/** 是否显示交互按钮，默认 `true` */
	button?: boolean;
	/** 按钮位置，默认 `bottom` */
	buttonPostion?: 'top' | 'bottom';
	/** 弹层关闭前执行，可以传入 promise */
	beforeClose?: Fn<[], Awaitable<any>>;
	/** 弹出层的标题，可以不设置 */
	title?: string;
	component?: T;
	componentProps?: GetProps<T>;
} & InteractMask &
	InteractButton;

export type InteractTipProps = {
	/** 提示内容 */
	message: string;
	position?: 'top' | 'bottom' | 'center' | 'stick-top' | 'stick-bottom';
	type?: 'success' | 'primary' | 'warning' | 'error' | 'info';
	/** tip 显示时间，单位毫秒，默认 3000 毫秒 */
	duration?: number;
};

export type InteractLoadingProps = {
	text?: string;
	/** 加载时间，不传则需要手动关闭 */
	duration?: number;
};
