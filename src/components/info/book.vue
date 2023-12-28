<template>
	<view v-if="!render" class="book-info-no-render" :class="noData === true ? 'placeholder' : 'locading'"></view>
	<view v-else class="full-size book-info-container">
		<view class="image">
			<image src="" mode="scaleToFill" />
		</view>
		<view class="info">
			<view class="text-ellipsis title">{{ renderData?.novelName ?? '' }}</view>
			<view class="text-ellipsis author">作者：{{ renderData?.author?.name ?? '' }}</view>
			<view class="text-ellipsis type">类型：{{ renderData?.novelType ?? '' }}</view>
			<view class="no-scrollbar introduction">{{ renderData?.introduction ?? '' }}</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import type { HomePageExcludeChapter } from '@/regular/@types/homepage';
import { bookInfo } from '@/regular/index';

interface Props {
	bookId: string;
}

const PlaceholderText = {
	locading: '加载中...',
	placeholder: '暂无数据',
	noId: '书籍id未知',
	system: '系统错误',
};

const render = ref(false);
const noData = ref(false);
const placeholder = ref(PlaceholderText.placeholder);

/** 渲染数据 */
let renderData: HomePageExcludeChapter;

const props = withDefaults(defineProps<Props>(), {
	bookId: '',
});

function requestBookInfo(id: string) {
	render.value = false;
	if (!id) {
		noData.value = true;
		placeholder.value = PlaceholderText.noId;
		return;
	}
	noData.value = false;
	placeholder.value = PlaceholderText.locading;
	bookInfo(id)
		.then(data => {
			if (!data) {
				noData.value = true;
				placeholder.value = PlaceholderText.placeholder;
				return;
			}
			renderData = data;
			render.value = true;
			placeholder.value = '';
		})
		.catch(err => {
			noData.value = true;
			placeholder.value = PlaceholderText.system;
			throw new Error(err);
		});
}

watch(
	() => props.bookId,
	newVal => {
		requestBookInfo(newVal);
	},
	{
		immediate: true,
	},
);
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
