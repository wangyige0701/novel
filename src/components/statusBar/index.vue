<template>
	<view
		id="statusBar"
		:style="{ '--status-bar-height': props.fullScreen ? 0 : statusBarHeight + 'px' }"
		:class="isNeedFull ? 'full-screen flex-child' : ''"
		@click="isNeedFull ? onClick() : null"
	>
		<view
			v-if="!props.fullScreen"
			class="status-bar-heigth"
			:style="{ 'background-color': props.color ?? '#fff' }"
		></view>
		<view v-if="isNeedFull" class="no-scrollbar slot-container">
			<slot name="statusBar" :height="statusBarHeight"></slot>
		</view>
		<slot v-else name="statusBar" :height="statusBarHeight"></slot>
	</view>
</template>

<script setup lang="ts">
import { GlobalStore } from '@store';

interface Props {
	/** 状态栏高度区域的背景色，默认白色 */
	color?: string;
	/** 插槽内容是否需要铺满整个页面 */
	full?: boolean;
	/** 应用是否全屏展示 */
	fullScreen?: boolean;
}

interface Emits {
	(id: 'click', value: true): void;
}

/** 状态栏高度 */
const statusBarHeight = GlobalStore.data.statusBarHeight;
/** 容器是否需要撑满 */
const isNeedFull = computed(() => props.full === true || props.fullScreen === true);

const props = withDefaults(defineProps<Props>(), {
	color: '#fff',
	full: false,
	fullScreen: false,
});

const emits = defineEmits<Emits>();

/** 当前全屏展示情况 */
let fullScreenState: boolean = props.fullScreen;

/** 全屏状态设置 */
function fullScreen(state: boolean = false) {
	//#ifdef APP-PLUS
	plus.navigator.setFullscreen(state);
	//#endif
}

function onClick() {
	emits('click', true);
}

watch(
	() => props.fullScreen,
	newValue => {
		if (newValue !== fullScreenState) {
			fullScreenState = newValue;
			fullScreen(newValue);
		}
	},
	{
		immediate: true,
	},
);
</script>

<style scoped lang="scss">
#statusBar {
	width: 100%;
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	position: sticky;
	top: 0;

	&.flex-child {
		height: 100vh;
		overflow: hidden;

		.slot-container {
			height: calc(100vh - var(--status-bar-height));
			position: relative;
			overflow: scroll;
		}
	}
}

.status-bar-heigth {
	width: 100%;
	height: var(--status-bar-height);
}
</style>
