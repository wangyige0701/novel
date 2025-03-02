<template>
	<view class="flex flex-col modal" :animation="animation" @click.stop="">
		<view v-if="!props.hideTitle" class="text-center text-ellipsis modal_title">{{ props.title }}</view>
		<view class="text-center modal_message">
			<template v-if="props.component">
				<component :is="props.component" v-bind="{ ...props.componentProps }" />
			</template>
			<text v-else>{{ props.message }}</text>
		</view>
		<view class="flex flex-row flex-nowrap relative modal_operation">
			<Button class="flex-1 cancel" @click.stop="cancel" :disabled="statusRef.cancel">
				{{ props.cancelButtonText }}
			</Button>
			<Button class="flex-1 confirm" @click.stop="confirm" :loading="statusRef.confirm">
				{{ props.confirmButtonText }}
			</Button>
		</view>
	</view>
</template>

<script setup lang="ts">
import type { InteractExtend, InteractExtendEmit, InteractModalProps } from '@/@types/components/interact';
import InteractConfig from '@/config/interact';
import Button from '@/components/Button.vue';
import { isAsyncFunction, isPromise, isPromiseLike } from '@wang-yige/utils';
import { useStatusRef } from '@/common/status';
import { CloseTypes } from '@/config/interact';
import { useAnimation } from '../animation';

const statusRef = useStatusRef('cancel', 'confirm');
const props = withDefaults(defineProps<InteractModalProps & InteractExtend>(), {
	title: '提示',
	hideTitle: false,
	cancelButtonText: InteractConfig.cancelText,
	confirmButtonText: InteractConfig.confirmText,
});
const emit = defineEmits<InteractExtendEmit>();
const animation = useAnimation(
	() => props.visible,
	animation => {
		if (props.visible) {
			animation.scale(1, 1).step();
		} else {
			animation.scale(1.2, 1.2).step();
		}
		return animation.export();
	},
	{
		duration: props.transitionDuration,
		timingFunction: props.transitionTimingFunction,
	},
);

async function changeLock(state: boolean) {
	emit('update:lock', state);
	await nextTick();
}

function cancel() {
	if (props.lock) {
		return;
	}
	if (props.onCancel) {
		props.onCancel();
	}
	props.close();
	props.reject('cancel');
}

async function confirm() {
	if (props.lock) {
		return;
	}
	if (props.onOk) {
		if (isPromise(props.onOk) || isPromiseLike(props.onOk) || isAsyncFunction(props.onOk)) {
			await changeLock(true);
			statusRef.onCancel().onConfirm();
			await props.onOk();
			statusRef.offCancel().offConfirm();
			await changeLock(false);
		} else {
			props.onOk();
		}
	}
	props.close();
	props.resolve({ type: CloseTypes.Confirm });
}

defineOptions({
	inheritAttrs: false,
});

defineExpose({
	closeByMask() {
		// modal 组件通过遮罩层调用返回拒绝状态
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
		border-radius: 0;
		border-color: transparent;
	}
	.confirm {
		color: Scss.$primary-color;
	}
}
</style>
