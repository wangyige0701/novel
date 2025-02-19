import { Fn } from '@wang-yige/utils';
import { StatusRef } from 'status-ref';
import { customRef } from 'vue';

/**
 * 引用 vue 的 customRef 创建状态管理器
 */
export const useStatusRef = StatusRef.create(() => {
	const cache = new Map<string, [Fn, Fn]>();
	return {
		track: (target, key) => {
			if (!cache.has(key)) {
				let _track: Fn, _trigger: Fn;
				customRef((track, trigger) => {
					_track = track;
					_trigger = trigger;
					return {
						get() {},
						set() {},
					};
				});
				cache.set(key, [_track!, _trigger!]);
			}
			cache.get(key)![0]();
		},
		trigger: (target, key) => {
			cache.get(key)![1]();
		},
	};
});
