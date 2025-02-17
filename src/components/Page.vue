<template>
	<view v-bind="{ ...$attrs }">
		<slot></slot>
		<Interact />
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
