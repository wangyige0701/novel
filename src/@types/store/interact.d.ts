import type { Fn, PromiseReject, PromiseResolve } from '@wang-yige/utils';
import type { Component } from 'vue';
import type {
	InteractLoadingProps,
	InteractModalProps,
	InteractPopupProps,
	InteractResolve,
	InteractTipProps,
	InteractUses,
} from '@/@types/components/interact';

export type InteractBindTypeUse = Fn<[type: InteractTipProps['type'], data: any], any>;

type InteractBindPick<T extends InteractBindTypeUse> = Fn<[options: Parameters<T>[1]], ReturnType<T>>;

export type InteractBindType<T extends InteractBindTypeUse> = {
	success: InteractBindPick<T>;
	primary: InteractBindPick<T>;
	warning: InteractBindPick<T>;
	error: InteractBindPick<T>;
	info: InteractBindPick<T>;
};

export type InteractStoreUses = InteractUses;

export type InteractStoreParams = InteractModalProps | InteractTipProps | InteractPopupProps | InteractLoadingProps;

export type InteractStoreListItem = {
	index: number;
	use: InteractStoreUses;
	options: InteractStoreParams;
	resolve: PromiseResolve<InteractResolve>;
	reject: PromiseReject;
	visible: Ref<boolean>;
	lock: Ref<boolean>;
};

export type InteractStoreOptions<T extends InteractStoreUses> = T extends 'modal'
	? InteractModalProps
	: T extends 'tip'
		? InteractTipProps
		: T extends 'popup'
			? InteractPopupProps
			: T extends 'loading'
				? InteractLoadingProps
				: never;

/** 去除 type 属性的 tip 组件属性配置，用于调用 */
export type InteractTipOptions = Omit<InteractTipProps, 'type'>;

export type InteractModalOptions<T = Component> = Omit<InteractModalProps<T>, 'mask'>;

export type InteractPopupOptions<T = Component> = Omit<InteractPopupProps<T>, 'mask'>;

export type InteractLoadingOptions = InteractLoadingProps;
