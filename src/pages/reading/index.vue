<template>
	<Page class="width-full height-full">
		<view class="width-full height-full scroll-y reading">
			<view class="width-full content" v-html="unref(content)"></view>
			<view class="width-full flex flex-row flex-nowrap operate">
				<text class="flex-1 flex flex-center change">上一章</text>
				<text class="flex-1 flex flex-center change">下一章</text>
			</view>
		</view>
	</Page>
</template>

<script setup lang="ts">
import { unref } from 'vue';
import { getReading } from '@/common/reading';
import Page from '@/components/Page.vue';

backInteract();
const { page, content, loading } = getReading();
</script>

<style scoped lang="scss">
@use '@/style/index.scss' as Scss;

.reading {
	--operate: 150rpx;
}
.content {
	min-height: calc(100% - var(--operate));
	color: Scss.$text-color;
	font-size: Scss.$font-xl;
}
.operate {
	height: var(--operate);
	.change {
		color: Scss.$text-color;
		font-size: Scss.$font-lg;
		&:active {
			background-color: Scss.$info-lightly-color;
		}
	}
}
</style>
