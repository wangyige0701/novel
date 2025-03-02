import InteractConfig from '@/config/interact';
import { VOID_OBJECT, type Fn } from '@wang-yige/utils';
import { ref, onMounted } from 'vue';

interface AnimationOptions {
	duration?: number;
	delay?: number;
	timingFunction?: UniNamespace.CreateAnimationOptions['timingFunction'];
}

/**
 * 创建动画响应处理对象
 * @param bind 处理需要跟踪响应式对象
 * @param animation 动画处理回调，传入 UniApp.Animation 对象
 * @param options 动画配置
 * @returns 绑定的动画对象
 */
export function useAnimation(
	bind: Fn<[], any>,
	animation: Fn<[animation: UniApp.Animation], any>,
	options?: AnimationOptions,
) {
	// #ifdef APP-PLUS
	const isMounted = ref(false);
	onMounted(() => {
		setTimeout(() => {
			isMounted.value = true;
		}, InteractConfig.renderDelay);
	});
	// #endif
	const _animation = uni.createAnimation({
		...options,
	});
	return computed(() => {
		bind();
		// #ifdef APP-PLUS
		if (!isMounted.value) {
			return VOID_OBJECT;
		}
		// #endif
		return animation(_animation);
	});
}
