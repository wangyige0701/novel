export interface SearchComponentProps {
	modelValue?: string;
	placeholder?: string;
	text?: string;
	back?: boolean;
}

export interface SearchComponentEmits {
	(e: 'update:modelValue', value: string): void;
	(e: 'search', value: string): void;
}
