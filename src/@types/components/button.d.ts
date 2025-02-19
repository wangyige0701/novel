export interface ButtonProps {
	size?: 'default' | 'small' | 'large';
	type?: 'primary' | 'default' | 'danger' | 'success' | 'warning';
	disabled?: boolean;
	loading?: boolean;
}

export interface ButtonEmits {
	(e: 'click', val: any): void;
}
