import type { Fn, PromiseReject, PromiseResolve } from '@wang-yige/utils';
import type {
	InteractLoadingProps,
	InteractModalProps,
	InteractPopupProps,
	InteractTipProps,
	InteractUses,
} from '@/@types/components/interact';

export type InteractBindTypeUse = Fn<[type: InteractTipProps['type'], data: any], any>;

type InteractBindPick<T extends InteractBindTypeUse> = Fn<[options: Parameters<T>[1]], ReturnType<T>>;

export type InteractBindType<T extends InteractBindTypeUse> = {
	success: InteractBindPick<T>;
	warning: InteractBindPick<T>;
	error: InteractBindPick<T>;
	info: InteractBindPick<T>;
};

export type InteractStoreUses = InteractUses;

export type InteractStoreParams = InteractModalProps | InteractTipProps | InteractPopupProps | InteractLoadingProps;

export type InteractStoreListItem = {
	use: InteractStoreUses;
	options: InteractStoreParams;
	resolve: PromiseResolve<void>;
	reject: PromiseReject;
	visible: Ref<boolean>;
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

export type InteractModalOptions = InteractModalProps;

export type InteractPopupOptions = InteractPopupProps;

export type InteractLoadingOptions = InteractLoadingProps;
