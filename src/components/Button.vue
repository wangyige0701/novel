<template>
	<view type="default" class="flex flex-center a-button" :class="[`size_${props.size}`, `type_${props.type}`]">
		<slot></slot>
	</view>
</template>

<script setup lang="ts">
import type { ButtonProps } from '@/@types/components/button';

const props = withDefaults(defineProps<ButtonProps>(), {
	type: 'default',
	size: 'default',
});
</script>

<style scoped lang="scss">
@use '@/style/index.scss' as Scss;

.a-button {
	border: none;
	font-size: Scss.$font-lg;
	color: Scss.$text-normal-color;
}
</style>
