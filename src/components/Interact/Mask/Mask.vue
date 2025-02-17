<template>
	<view
		class="flex flex-col flex-center mask"
		:animation="animation"
		:style="{
			zIndex: props.zIndex,
			bottom: props.mask ? '0' : '100vh',
			background: props.maskBgColor,
		}"
		@click.stop="close"
	>
		<slot></slot>
	</view>
</template>

<script setup lang="ts">
import type { InteractMaskProps } from '@/@types/components/interact';
import InteractConfig from '@/config/interact';

const props = withDefaults(defineProps<InteractMaskProps>(), {
	mask: true,
	maskClosable: true,
	maskBgColor: 'rgba(0, 0, 0, 0.5)',
	visible: true,
	duration: InteractConfig.duration,
});
const animation = computed(() => {
	const animation = uni.createAnimation({
		duration: props.duration,
		timingFunction: 'ease',
	});
	if (props.visible) {
		animation.opacity(1).step();
	} else {
		animation.opacity(0).step();
	}
	return animation.export();
});

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
	position: fixed;
	inset: 0;
	background-color: transparent;
	opacity: 0;
}
</style>
