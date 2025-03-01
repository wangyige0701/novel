<template>
	<view class="full-screen">
		<view class="status_bar"></view>
		<view class="page">
			<view v-bind="{ ...$attrs }">
				<slot></slot>
				<Interact />
			</view>
		</view>
	</view>
</template>

<script lang="ts">
/**
 * 全局页面组件，封装公用逻辑
 */
export default {};
</script>
<script setup lang="ts">
import Interact from '@/components/Interact/Index.vue';

defineOptions({
	inheritAttrs: false,
});
</script>

<style scoped lang="scss">
.status_bar {
	height: var(--status-bar-height);
}
.page {
	height: calc(100vh - var(--status-bar-height));
}
</style>
