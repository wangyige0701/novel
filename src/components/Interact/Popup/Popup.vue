<template>
	<view class="absolute popup" :class="[`direction_${props.direction}`]" :animation="animation" @click.stop="">
		<view class="full flex flex-col popup_box">
			<template v-if="props.button">
				<view class="flex flex-row flex-nowrap popup_button" :class="[`button_${props.buttonPostion}`]">
					<view class="flex flex-center flex-1">
						<Button class="cancel" @click.stop="cancel" :disabled="statusRef.cancel">
							{{ props.cancelButtonText }}
						</Button>
					</view>
					<view class="flex flex-center flex-1">
						<Button class="confirm" type="primary" @click.stop="confirm" :loading="statusRef.confirm">
							{{ props.confirmButtonText }}
						</Button>
					</view>
				</view>
			</template>
			<template v-else>
				<text
					class="icon-close absolute popup_close"
					:class="[props.closePosition]"
					@click.stop="() => close(CloseTypes.Icon)"
				></text>
			</template>
			<view class="flex flex-col full relative">
				<view v-if="props.title" class="flex flex-center popup_title">{{ props.title }}</view>
				<view class="popup_content">
					<template v-if="props.component">
						<component :is="props.component" v-bind="{ ...props.componentProps }" />
					</template>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import type { InteractExtend, InteractExtendEmit, InteractPopupProps } from '@/@types/components/interact';
import { isAsyncFunction, isPromise, isPromiseLike, VOID_FUNCTION, VOID_OBJECT } from '@wang-yige/utils';
import InteractConfig from '@/config/interact';
import Button from '@/components/Button.vue';
import { useStatusRef } from '@/common/status';
import { CloseTypes } from '@/common/interact';

const size = ref(0);
const statusRef = useStatusRef('cancel', 'confirm');
const props = withDefaults(defineProps<InteractPopupProps & InteractExtend>(), {
	direction: 'bottom',
	closePosition: 'top-right',
	closeIcon: false,
	button: true,
	buttonPostion: 'top',
	cancelButtonText: InteractConfig.cancelText,
	confirmButtonText: InteractConfig.confirmText,
});
const emit = defineEmits<InteractExtendEmit>();
const animation = computed(() => {
	const animation = uni.createAnimation({
		duration: props.transitionDuration,
		timingFunction: props.transitionTimingFunction,
	});
	let value = 0;
	if (!props.visible) {
		value = unref(size);
	}
	// 不同方向的动画
	if (props.direction === 'bottom') {
		animation.translateY(value).step();
	} else if (props.direction === 'top') {
		animation.translateY(-1 * value).step();
	} else if (props.direction === 'left') {
		animation.translateX(-1 * value).step();
	} else if (props.direction === 'right') {
		animation.translateX(value).step();
	} else if (props.direction === 'center') {
		if (props.visible) {
			animation.scale(1, 1).step();
		} else {
			animation.scale(0.8, 0.8).step();
		}
	} else {
		return VOID_OBJECT;
	}
	return animation.export();
});

watch(
	() => props.direction,
	() => {
		getRectSize();
	},
);

/**
 * 更新可视区域尺寸
 */
function getRectSize() {
	const instance = getCurrentInstance();
	if (!instance) {
		return;
	}
	uni.createSelectorQuery()
		.in(instance.proxy)
		.select('.popup')
		.boundingClientRect(rect => {
			if (rect) {
				const { width = 0, height = 0 } = rect as UniApp.NodeInfo;
				size.value = props.direction === 'bottom' || props.direction === 'top' ? height : width;
			}
		})
		.exec();
}

async function changeLock(state: boolean) {
	emit('update:lock', state);
	await nextTick();
}

/**
 * 关闭统一调用
 */
async function close(type: CloseTypes) {
	if (props.lock) {
		return;
	}
	if (!props.beforeClose) {
		return handleClose(type);
	}
	// 处理关闭前的触发函数
	if (isPromise(props.beforeClose) || isPromiseLike(props.beforeClose) || isAsyncFunction(props.beforeClose)) {
		await changeLock(true); // 此时不允许关闭弹窗
		await props.beforeClose().catch(VOID_FUNCTION);
		await changeLock(false);
	} else {
		props.beforeClose();
	}
	handleClose(type);
}

async function cancel() {
	if (props.lock) {
		return;
	}
	if (props.onCancel) {
		props.onCancel();
	}
	await close(CloseTypes.Cancel);
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
	await close(CloseTypes.Confirm);
}

function handleClose(type: CloseTypes) {
	props.close();
	props.resolve({ type });
}

onMounted(() => {
	getRectSize();
});

defineExpose({
	async closeByMask() {
		await close(CloseTypes.Mask);
	},
});
</script>

<style scoped lang="scss">
@use '@/style/index.scss' as Scss;

.popup {
	--popup-size: 55%;
	--border-radius: 35rpx;
	--box-shadow: rgba(255, 255, 255, 0.5);
	background-color: Scss.$white;
	box-shadow: 0px 0px 5px 0px var(--box-shadow);
	overflow: hidden;
	&.direction_bottom,
	&.direction_top {
		width: 100%;
		height: var(--popup-size);
	}
	&.direction_left,
	&.direction_right {
		width: var(--popup-size);
		height: 100%;
	}
	&.direction_bottom {
		bottom: 0;
		border-radius: var(--border-radius) var(--border-radius) 0 0;
		transform: translateY(100%);
	}
	&.direction_top {
		top: 0;
		border-radius: 0 0 var(--border-radius) var(--border-radius);
		transform: translateY(-100%);
	}
	&.direction_left {
		left: 0;
		border-radius: 0 var(--border-radius) var(--border-radius) 0;
		transform: translateX(-100%);
	}
	&.direction_right {
		right: 0;
		border-radius: var(--border-radius) 0 0 var(--border-radius);
		transform: translateX(100%);
	}
	&.direction_center {
		width: 90%;
		height: 65%;
		border-radius: var(--border-radius);
		transform: scale(0.8);
	}
}

.popup_box {
	padding: 35rpx;
	&:has(.popup_button.button_top) {
		padding-top: 0;
	}
	&:has(.popup_button.button_bottom) {
		flex-direction: column-reverse;
		padding-bottom: 0;
	}
	.popup_button {
		padding: 20rpx 0;
		.cancel,
		.confirm {
			width: 200rpx;
			height: 60rpx;
			font-size: Scss.$font-base;
		}
	}
	.popup_close {
		--icon-gap: 15rpx;
		color: Scss.$text-normal-color;
		font-size: Scss.$font-lg;
		&.top-right {
			top: var(--icon-gap);
			right: var(--icon-gap);
		}
		&.bottom-right {
			bottom: var(--icon-gap);
			right: var(--icon-gap);
		}
		&.top-left {
			top: var(--icon-gap);
			left: var(--icon-gap);
		}
		&.bottom-left {
			bottom: var(--icon-gap);
			left: var(--icon-gap);
		}
	}
}

.popup_title {
	height: Scss.$font-xl;
	font-size: Scss.$font-lg;
	color: Scss.$text-color;
}
</style>
