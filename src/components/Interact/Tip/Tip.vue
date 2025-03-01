<template>
	<view class="absolute tip" :class="[`type_${props.type}`, `position_${props.position}`]" :animation="animation">
		<text>{{ props.message }}</text>
	</view>
</template>

<script setup lang="ts">
import type { InteractExtend, InteractTipProps } from '@/@types/components/interact';
import { isNumber, VOID_OBJECT } from '@wang-yige/utils';
import { CloseTypes } from '@/config/interact';

const height = ref(0);
const props = withDefaults(defineProps<InteractTipProps & InteractExtend>(), {
	position: 'center',
	type: 'success',
	duration: 3000,
});
const animation = computed(() => {
	props.visible, height.value;
	if ((props.position !== 'stick-bottom' && props.position !== 'stick-top') || !height.value) {
		return VOID_OBJECT;
	}
	const animation = uni.createAnimation({
		duration: props.transitionDuration,
		timingFunction: props.transitionTimingFunction,
	});
	if (props.position === 'stick-bottom') {
		animation.translateY(props.visible ? -1 * unref(height) : 0).step();
	} else {
		animation.translateY(props.visible ? 0 : -1 * unref(height)).step();
	}
	return animation.export();
});

function getHeight() {
	const instance = getCurrentInstance();
	if (!instance) {
		return;
	}
	uni.createSelectorQuery()
		.in(instance.proxy)
		.select('.tip')
		.boundingClientRect(rect => {
			if (rect) {
				const { height: h = 0 } = rect as UniApp.NodeInfo;
				height.value = h;
			}
		})
		.exec();
}

let timeout: NodeJS.Timeout | undefined;
onMounted(() => {
	getHeight();
	const time = isNumber(props.duration) ? Math.max(0, props.duration) : 3000;
	timeout = setTimeout(() => {
		props.close();
		props.resolve({ type: CloseTypes.Timeout, duration: time });
	}, time);
});

onBeforeUnmount(() => {
	if (timeout) {
		clearTimeout(timeout);
	}
});
</script>

<style scoped lang="scss">
@use '@/style/index.scss' as Scss;

.tip {
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	max-width: 65%;
	padding: 15rpx 20rpx;
	// border
	border-radius: 5rpx;
	border-width: 1rpx;
	border-style: solid;
	border-color: transparent;
	// color
	background-color: Scss.$white;
	color: Scss.$text-normal-color;
	font-size: Scss.$font-lg;
	text-align: center;
	// transition
	transition-duration: 0.3s;
	transition-timing-function: ease;
	transition-property: background-color, color, border-color;
	&.position_top {
		top: 25%;
	}
	&.position_center {
		top: 50%;
	}
	&.position_bottom {
		top: 75%;
	}
	&.position_stick-top {
		top: 0;
		transform: translateY(-100%);
	}
	&.position_stick-bottom {
		top: 100%;
		transform: translateY(0);
	}
	&.type_success {
		color: Scss.$success-color;
		border-color: Scss.$success-color;
		background-color: Scss.$success-lightly-color;
	}
	&.type_primary {
		color: Scss.$primary-color;
		border-color: Scss.$primary-color;
		background-color: Scss.$primary-lightly-color;
	}
	&.type_error {
		color: Scss.$error-color;
		border-color: Scss.$error-color;
		background-color: Scss.$error-lightly-color;
	}
	&.type_warning {
		color: Scss.$warning-color;
		border-color: Scss.$warning-color;
		background-color: Scss.$warning-lightly-color;
	}
	&.type_info {
		color: Scss.$info-color;
		border-color: Scss.$info-color;
		background-color: Scss.$info-lightly-color;
	}
	&.position_stick-top,
	&.position_stick-bottom {
		max-width: 100%;
		border-radius: 0;
		left: 0;
		right: 0;
		&.type_success {
			color: Scss.$white;
			border-color: Scss.$success-color;
			background-color: Scss.$success-color;
		}
		&.type_primary {
			color: Scss.$white;
			border-color: Scss.$primary-color;
			background-color: Scss.$primary-color;
		}
		&.type_error {
			color: Scss.$white;
			border-color: Scss.$error-color;
			background-color: Scss.$error-color;
		}
		&.type_warning {
			color: Scss.$white;
			border-color: Scss.$warning-color;
			background-color: Scss.$warning-color;
		}
		&.type_info {
			color: Scss.$white;
			border-color: Scss.$info-color;
			background-color: Scss.$info-color;
		}
	}
}
</style>
