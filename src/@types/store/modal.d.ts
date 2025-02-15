import type { Fn } from '@wang-yige/utils';
import type { ModalProps } from '@/@types/components/modal';

export type ModalStoreData = ModalProps;

type ModalParams = [title: string, message: string, options?: Pick<ModalProps, 'mask' | 'closeByMask' | 'maskColor'>];

type LoadingModalOptions = Pick<ModalProps, 'message' | 'maskColor'>;

export type ModalUsage<T extends Fn<[options: ModalStoreData], infer R>> = {
	success: Fn<ModalParams, R>;
	error: Fn<ModalParams, R>;
	warning: Fn<ModalParams, R>;
	info: Fn<ModalParams, R>;
};
