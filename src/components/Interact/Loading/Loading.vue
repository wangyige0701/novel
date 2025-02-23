<template>
	<view class="flex flex-row flex-nowrap flex-center loading_container">
		<view class="flex flex-center loading_icon">
			<text class="icon-loading-2 loading"></text>
		</view>
		<text>{{ props.text }}</text>
	</view>
</template>

<script setup lang="ts">
import type { InteractExtend, InteractLoadingProps } from '@/@types/components/interact';
import { CloseTypes } from '@/config/interact';
import { isNumber } from '@wang-yige/utils';

const props = withDefaults(defineProps<InteractLoadingProps & InteractExtend>(), {
	text: '加载中...',
});

onMounted(() => {
	if (isNumber(props.duration) && props.duration > 0) {
		setTimeout(() => {
			props.close();
			props.resolve({ type: CloseTypes.Timeout, duration: props.duration });
		}, props.duration);
	}
});
</script>

<style scoped lang="scss">
@use 'sass:color';
@use '@/style/index.scss' as Scss;

.loading_container {
	font-size: Scss.$font-lg;
	color: color.scale(Scss.$primary-color, $lightness: 50%);
}

.loading_icon {
	width: 40rpx;
	height: 40rpx;
}
</style>
