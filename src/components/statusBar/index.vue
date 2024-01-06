<template>
	<view
		id="statusBar"
		class="status-bar-container"
		:style="{ '--status-bar-height': (props.fullScreen ? 0 : statusBarHeight) + 'px' }"
		:class="[isNeedFull ? 'full-screen flex-child' : '', props.autoHeight ? 'auto-height' : '']"
		@click="isNeedFull ? useFuncs.onClick() : null"
	>
		<view
			v-if="!props.fullScreen"
			class="status-bar-heigth"
			:class="props.autoHeight ? 'auto-height' : ''"
			:style="{ 'background-color': props.color ?? '#fff' }"
		></view>
		<view v-if="isNeedFull" class="no-scrollbar slot-container" :class="props.autoHeight ? 'auto-height' : ''">
			<slot name="statusBar" :height="statusBarHeight"></slot>
		</view>
		<slot v-else name="statusBar" :height="statusBarHeight"></slot>
	</view>
</template>

<script setup lang="ts">
import { immediate } from '@/config/watch';
import { GlobalStore } from '@store/static';

interface Props {
	/** 状态栏高度区域的背景色，默认白色 */
	color?: string;
	/** 插槽内容是否需要铺满整个页面 */
	full?: boolean;
	/** 应用是否全屏展示 */
	fullScreen?: boolean;
	/** 容器内容高度是否自适应，非全屏状态下默认自适应，全屏状态下最小高度是屏幕高度 */
	autoHeight?: boolean;
}

interface Emits {
	(id: 'click', value: true): void;
}

/** 状态栏高度 */
const statusBarHeight = GlobalStore.data.statusBarHeight;

const props = withDefaults(defineProps<Props>(), {
	color: '#fff',
	full: false,
	fullScreen: false,
	autoHeight: false,
});

const emits = defineEmits<Emits>();

/** 容器是否需要撑满 */
const isNeedFull = computed(() => props.full === true || props.fullScreen === true);

/** 使用的方法对象 */
const useFuncs = {
	/** 全屏状态设置 */
	fullScreen(state: boolean = false) {
		//#ifdef APP-PLUS
		plus.navigator.setFullscreen(state);
		//#endif
	},

	onClick() {
		emits('click', true);
	},
};

watch(
	() => props.fullScreen,
	newValue => {
		useFuncs.fullScreen(newValue);
	},
	immediate,
);
</script>

<style scoped lang="scss">
#statusBar .status-bar-heigth {
	width: 100%;
	height: var(--status-bar-height);

	&.auto-height {
		position: sticky;
		top: 0;
	}
}

#statusBar {
	width: 100%;
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	position: sticky;
	top: 0;

	&.status-bar-container.auto-height {
		height: auto;
	}

	&.flex-child {
		height: 100vh;
		overflow: hidden;

		.slot-container {
			height: calc(100vh - var(--status-bar-height));
			position: relative;
			overflow: scroll;

			&.auto-height {
				min-height: calc(100vh - var(--status-bar-height));
				height: auto;
			}
		}
	}
}
</style>
