<template>
	<view class="flex flex-col modal" :animation="animation" @click.stop="">
		<view v-if="!props.hideTitle" class="text-center text-ellipsis modal_title">{{ props.title }}</view>
		<view class="text-center modal_message">
			<template v-if="props.component">
				<component :is="props.component" />
			</template>
			<text v-else>{{ props.message }}</text>
		</view>
		<view class="flex flex-row flex-nowrap modal_operation">
			<Button class="flex-1 cancel" @click.stop="cancel">{{ props.cancelButtonText }}</Button>
			<Button class="flex-1 confirm" @click.stop="confirm">{{ props.confirmButtonText }}</Button>
		</view>
	</view>
</template>

<script setup lang="ts">
import type { InteractExtend, InteractModalProps } from '@/@types/components/interact';
import InteractConfig from '@/config/interact';
import Button from '@/components/Button.vue';

const props = withDefaults(defineProps<InteractModalProps & InteractExtend>(), {
	title: '提示',
	hideTitle: false,
	cancelButtonText: InteractConfig.cancelText,
	confirmButtonText: InteractConfig.confirmText,
});
const animation = computed(() => {
	const animation = uni.createAnimation({
		duration: props.duration,
		timingFunction: 'ease',
	});
	if (props.visible) {
		animation.scale(1, 1).step();
	} else {
		animation.scale(1.2, 1.2).step();
	}
	return animation.export();
});

function cancel() {
	props.close();
	props.reject('cancel');
}

function confirm() {
	props.close();
	props.resolve();
}

defineOptions({
	inheritAttrs: false,
});

defineExpose({
	closeByMask() {
		props.reject('cancel');
	},
});
</script>

<style scoped lang="scss">
@use '@/style/index.scss' as Scss;

.modal {
	width: 500rpx;
	min-height: 250rpx;
	border-radius: Scss.$border-radius-lg;
	background-color: Scss.$white;
	transform: scale(1.2);
}

.modal_title {
	font-size: Scss.$font-xl;
	padding: 17px 15px 0;
	color: Scss.$text-color;
}

.modal_message {
	font-size: Scss.$font-lg;
	padding: 17px;
	color: Scss.$text-normal-color;
}

.modal_operation {
	height: 80rpx;
	border-top: 1px solid Scss.$border-splice-color;
	border-radius: 0 0 Scss.$border-radius-lg Scss.$border-radius-lg;
	background-color: Scss.$white;
	position: relative;
	overflow: hidden;
	&::before {
		content: '';
		display: inline-block;
		width: 1px;
		height: 50%;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: Scss.$border-splice-color;
	}
	.cancel,
	.confirm {
		&:active {
			background-color: Scss.$bg-hover-color;
		}
	}
	.cancel {
		color: Scss.$text-normal-color;
	}
	.confirm {
		color: Scss.$primary-color;
	}
}
</style>
