/**
 * 弹层关闭类型
 */
export enum CloseTypes {
	Mask = 'mask',
	Icon = 'closeIcon',
	Cancel = 'cancel',
	Confirm = 'confirm',
	Timeout = 'timeout',
	Close = 'close',
}

export default {
	baseZIndex: 9999,
	/** 开关动画的延迟时间 */
	duration: 300,
	timingFunction: 'ease',
	confirmText: '确定',
	cancelText: '取消',
} as const;
