import type { Fn } from '@wang-yige/utils';

type ImageComponentMode =
	| 'scaleToFill'
	| 'aspectFit'
	| 'aspectFill'
	| 'widthFix'
	| 'heightFix'
	| 'top'
	| 'bottom'
	| 'center'
	| 'left'
	| 'right'
	| 'top left'
	| 'top right'
	| 'bottom left'
	| 'bottom right';

export interface ImageComponentProps {
	src: string;
	mode?: ImageComponentMode;
	lazyload?: boolean;
	reload?: Fn<[src: string], string | void>;
}

export interface ImageComponentEmits {
	(e: 'error', value: any): void;
	(e: 'load', value: any): void;
}
