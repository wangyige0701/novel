<template>
	<view
		v-if="!render.show"
		class="book-info-render-tip"
		:class="render.loading ? 'loading' : render.empty ? 'placeholder' : render.error ? 'error' : ''"
	>
		{{ placeholder }}
	</view>
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
import type { HomePageExcludeChapter } from '@common/regular/@types/homepage';
import { bookInfo } from '@common/regular/index';
import { pageRender } from '@common/reactive/pageRender';

interface Props {
	bookId: string;
	bookName: string;
}

/** 占位文本 */
const PlaceholderText = {
	loading: '加载中...',
	placeholder: '暂无数据',
	noId: '书籍id未知',
	system: '系统错误',
};
/** 渲染数据 */
let renderData: HomePageExcludeChapter;
/** 页面渲染状态 */
const render = pageRender();
/** 实际占位文字 */
const placeholder = ref('');

onBeforeUnmount(() => {
	watchStop?.();
	watchEffectStop?.();
});

const props = withDefaults(defineProps<Props>(), {
	bookId: '',
	bookName: '',
});

/**
 * 请求小说信息
 * @param id
 */
function requestBookInfo(id: string) {
	render.init();
	if (!id) {
		render.toEmpty();
		return;
	}
	render.toLoad();
	bookInfo(id)
		.then(data => {
			if (!data) {
				render.toEmpty();
				return;
			}
			renderData = data;
			render.toRender();
		})
		.catch(err => {
			render.toError();
			throw new Error(err);
		});
}

const watchStop = watch(
	() => props.bookId,
	newId => {
		requestBookInfo(newId);
	},
	{
		immediate: true,
	},
);

const watchEffectStop = watchEffect(() => {
	// 占位文字调整
	placeholder.value = render.loading
		? PlaceholderText.loading
		: render.empty
			? props.bookId
				? PlaceholderText.placeholder
				: PlaceholderText.noId
			: render.error
				? PlaceholderText.system
				: '';
});
</script>

<style scoped lang="scss">
@import '../../style/scss/config/main.scss';

.book-info-container {
	display: grid;
	grid-template-columns: 250rpx 1fr;
	grid-auto-rows: 100%;
	background-color: #fff;
	box-sizing: border-box;
	padding: $wyg-gap-base;

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
			margin-left: $wyg-spacing-row-base;
		}

		.introduction {
			font-size: $wyg-font-size-base;
			color: $wyg-text-color-normal;
			line-height: calc($wyg-font-size-base + 10rpx);
			text-indent: 2em;
			margin-top: $wyg-spacing-col-sm;
			overflow: scroll;
		}
	}
}
</style>
