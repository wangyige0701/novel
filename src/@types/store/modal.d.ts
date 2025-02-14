import type { Fn } from '@wang-yige/utils';
import type { ModalProps, ModalParams } from '@/@types/components/modal';

export type ModalStoreData = ModalProps;

export type ModalUsage<T extends Fn<[options?: ModalStoreData], infer R>> = {
	(options?: ModalStoreData): R;
	success: Fn<ModalParams, R>;
	error: Fn<ModalParams, R>;
	warning: Fn<ModalParams, R>;
	info: Fn<ModalParams, R>;
};
