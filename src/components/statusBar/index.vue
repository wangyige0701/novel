<template>
	<view id="statusBar">
		<view
			class="status-bar-heigth"
			:style="{
				height: statusBarHeight + 'px',
				'background-color': props.color ?? '#fff',
			}"
		></view>
		<slot name="statusBar"></slot>
	</view>
</template>

<script setup lang="ts">
interface Props {
	/** 状态栏高度区域的背景色，默认白色 */
	color?: string;
}

/** 状态栏高度 */
const statusBarHeight = inject<number>('statusBarHeight')!;

const props = withDefaults(defineProps<Props>(), {
	color: '#fff',
});
</script>

<style scoped lang="scss">
#statusBar {
	width: 100%;
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	position: sticky;
	top: 0;
}

.status-bar-heigth {
	width: 100%;
}
</style>
