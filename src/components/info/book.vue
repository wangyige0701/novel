<template>
	<view class="full-size book-info-container">
		<view class="image">
			<image src="" mode="scaleToFill" />
		</view>
		<view class="info">
			<view class="text-ellipsis title">{{ props.info?.novelName ?? '' }}</view>
			<view class="text-ellipsis author">作者：{{ props.info.author?.name ?? '' }}</view>
			<view class="text-ellipsis type">类型：{{ props.info?.novelType ?? '' }}</view>
			<view class="no-scrollbar introduction">{{ props.info?.introduction ?? '' }}</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import type { HomePageExcludeChapter } from '@/regular/@types/homepage';

interface Props {
	info: HomePageExcludeChapter;
}

const props = defineProps<Props>();

console.log(props.info);
</script>

<style scoped lang="scss">
@import '../../static/scss/config/main.scss';
@import '../../static/scss/config/color.scss';

.book-info-container {
	display: grid;
	grid-template-columns: 250rpx 1fr;
	grid-auto-rows: 100%;
	background-color: #fff;
	border-radius: 10rpx;
	box-sizing: border-box;
	padding: 20rpx;

	.image {
		display: flex;
		justify-content: center;
		align-items: center;

		image {
			width: 90%;
		}
	}

	.info {
		--title: 65rpx;
		--sub-title: 40rpx;
		display: grid;
		grid-template-rows: var(--title) var(--sub-title) var(--sub-title) 1fr;

		.title {
			line-height: var(--title);
			font-size: $wyg-font-size-title;
			color: $wyg-text-color;
			font-weight: bold;
		}

		.author,
		.type {
			line-height: var(--sub-title);
			font-size: $wyg-font-size-subtitle;
			color: $wyg-text-color-secondary;
			margin-left: 20rpx;
		}

		.introduction {
			font-size: $wyg-font-size-base;
			color: $wyg-text-color-normal;
			line-height: calc($wyg-font-size-base + 10rpx);
			text-indent: 2em;
			margin-top: 10rpx;
			overflow: scroll;
		}
	}
}
</style>
