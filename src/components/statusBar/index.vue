<template>
	<view
		id="statusBar"
		:style="{ '--status-bar-height': statusBarHeight + 'px' }"
		:class="props.full === true ? 'full-screen flex-child' : ''"
		@click="props.full === true ? onClick() : null"
	>
		<view class="status-bar-heigth" :style="{ 'background-color': props.color ?? '#fff' }"></view>
		<view v-if="props.full === true" class="no-scrollbar slot-container">
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
}

interface Emits {
	(id: 'click', value: true): void;
}

/** 状态栏高度 */
const statusBarHeight = GlobalStore.data.statusBarHeight;

const props = withDefaults(defineProps<Props>(), {
	color: '#fff',
	full: false,
});

const emits = defineEmits<Emits>();

function onClick() {
	emits('click', true);
}
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
