export interface ModalProps {
	/** 弹层种类，默认 `alert` */
	use: 'confirm' | 'alert' | 'loading';
	/** 弹层状态，默认 `info` */
	type?: 'success' | 'error' | 'warning' | 'info';
	/** 是否展示黑底遮罩层 */
	mask?: boolean;
	maskColor?: string;
	title?: string;
	message?: string;
	closeByMask?: boolean;
}

export type ModalItemProps = ModalProps & {
	zIndex: number | string;
	index: number;
};
