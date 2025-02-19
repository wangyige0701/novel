<template>
	<view
		type="default"
		class="flex flex-center a-button"
		:class="[`size_${props.size}`, `type_${props.type}`, props.disabled ? 'disabled' : '']"
		@click.stop="click"
	>
		<template v-if="!props.disabled && props.loading">
			<view class="icon-loading loading"></view>
		</template>
		<template v-else>
			<slot></slot>
		</template>
	</view>
</template>

<script setup lang="ts">
import type { ButtonEmits, ButtonProps } from '@/@types/components/button';

const props = withDefaults(defineProps<ButtonProps>(), {
	type: 'default',
	size: 'default',
	disabled: false,
	loading: false,
});

const emit = defineEmits<ButtonEmits>();

function click(e: any) {
	if (props.disabled || props.loading) {
		return;
	}
	emit('click', e);
}
</script>

<style scoped lang="scss">
@use '@/style/index.scss' as Scss;

.a-button {
	border: none;
	font-size: Scss.$font-lg;
	color: Scss.$text-normal-color;
	background-color: Scss.$white;
	border-radius: Scss.$border-radius-base;
	&:active {
		background-color: Scss.$bg-hover-color;
	}
	&.size_default {
		font-size: Scss.$font-lg;
	}
	&.size_large {
		font-size: Scss.$font-xl;
	}
	&.size_small {
		font-size: Scss.$font-base;
	}
	&.type_default {
		color: Scss.$text-normal-color;
		background-color: Scss.$white;
		&:active {
			background-color: Scss.$bg-hover-color;
		}
	}
	&.type_primary {
		color: Scss.$white;
		background-color: Scss.$primary-color;
		&:active {
			background-color: Scss.$primary-hover-color;
		}
	}
	&.type_danger {
		color: Scss.$white;
		background-color: Scss.$error-color;
		&:active {
			background-color: Scss.$error-hover-color;
		}
	}
	&.type_success {
		color: Scss.$white;
		background-color: Scss.$success-color;
		&:active {
			background-color: Scss.$success-hover-color;
		}
	}
	&.type_warning {
		color: Scss.$white;
		background-color: Scss.$warning-color;
		&:active {
			background-color: Scss.$warning-hover-color;
		}
	}
	&.disabled {
		opacity: 0.5;
		&:active {
			background-color: Scss.$text-disable-color;
		}
	}
}
</style>
