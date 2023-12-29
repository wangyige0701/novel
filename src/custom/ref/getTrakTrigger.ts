import type { Ref } from 'vue';
import { customRef } from 'vue';

/**
 * 显示定义ref，获取对应的trigger函数
 * @param value
 * @returns
 */
export function explicitlyTriggerRef<T>(value: T): [Ref<T>, VoidFunc, VoidFunc] {
	let val = value;
	let _track: VoidFunc;
	let _trigger: VoidFunc;
	const ref = customRef((track, trigger) => {
		_track = track;
		_trigger = trigger;
		return {
			get() {
				return val;
			},
			set(newValue) {
				val = newValue;
			},
		};
	});
	return [ref, _track!, _trigger!];
}
