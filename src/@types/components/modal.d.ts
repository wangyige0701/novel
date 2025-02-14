export interface ModalProps {
	use?: 'confirm' | 'alert';
	type?: 'success' | 'error' | 'warning' | 'info';
	mask?: boolean;
	title?: string;
	message?: string;
}

export type ModalParams = [title: string, message: string, mask?: boolean];
