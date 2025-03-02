<template>
	<view
		class="flex flex-col flex-center fixed overflow-hidden mask"
		:animation="animation"
		:style="{
			zIndex: props.zIndex,
			background: props.maskBgColor,
			pointerEvents: props.mask ? 'auto' : 'none',
		}"
		v-bind="{ ...$attrs }"
		@click.stop="close"
	>
		<slot></slot>
	</view>
</template>

<script setup lang="ts">
import type { InteractExtend, InteractMaskProps } from '@/@types/components/interact';
import InteractConfig from '@/config/interact';
import { useAnimation } from '../animation';

const props = withDefaults(defineProps<InteractMaskProps & Pick<InteractExtend, 'transitionTimingFunction'>>(), {
	mask: true,
	maskClosable: true,
	maskBgColor: 'rgba(0, 0, 0, 0.5)',
	visible: true,
	duration: InteractConfig.duration,
	timingFunction: 'ease',
});
const animation = useAnimation(
	() => props.visible,
	animation => {
		if (props.visible) {
			animation.opacity(1).step();
		} else {
			animation.opacity(0).step();
		}
		return animation.export();
	},
	{
		duration: props.duration,
		timingFunction: props.transitionTimingFunction,
	},
);

function close() {
	if (!props.maskClosable || !props.closeMask) {
		return;
	}
	props.closeMask();
}

defineOptions({
	inheritAttrs: false,
});
</script>

<style scoped lang="scss">
.mask {
	inset: 0;
	background-color: transparent;
	opacity: 0;
}
</style>
