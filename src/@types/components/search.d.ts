export interface SearchComponentProps {
	modelValue?: string;
	placeholder?: string;
	text?: string;
	/** 为 true 则物理返回触发路由返回，且不会触发路由跳转 Search 页 */
	back?: boolean;
}

export interface SearchComponentEmits {
	(e: 'update:modelValue', value: string): void;
	(e: 'search', value: string): void;
}
