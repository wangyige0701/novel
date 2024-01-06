<script lang="ts">
/** 文章内容容器 */
export default { name: 'ArticleContainer' };
</script>
<script setup lang="ts">
import type { ArticlebackgroundConfig, ArticleSizeConfig } from './data/readStyle';
import type { ArticleReturnVal } from '@common/regular/@types/article';
import type { ReadingDirectionVariables } from '@/store';
import { SettingAtricleCaches } from './data/articlesCache';
import { $_nextTick } from '@common/utils/nextTick';
import { useStore } from '@store/vuex';
import { immediate } from '@/config/watch';

import ArticleContent from './content.vue';

interface Props {
	chapterId: string;
	chapterName: string;
}

const store = useStore();
const { chapterCacheLength, readingTheme, readingFontSize, readingDirection } = store.state.reading;

/** 渲染列表 */
const renderList = new SettingAtricleCaches(/* chapterCacheLength */ 1);
/** 判断是否是首次加载，用于进行初始数据加载完成后的滚动条偏移 */
const firstRender = ref(true);
/** `scroll view`容器滚动高度 */
const scrollViewTop = ref(0);
/** 背景色的配置 */
const backgroundConfig = ref<ArticlebackgroundConfig>(readingTheme);
/** 字号的配置 */
const fontSizeConfig = ref<ArticleSizeConfig>(readingFontSize);
/** 翻看方向 */
const direction = ref<ReadingDirectionVariables>(readingDirection);

const props = defineProps<Props>();

renderList.onReadingChange = function (val: ArticleReturnVal & { __key: string }) {
	// 页面初始加载时滚动一次，防止滚动条移位
	$_nextTick(() => {
		if (direction.value === 'vertical' && val && firstRender.value) {
			firstRender.value = false;
			renderList.onReadingChange = void 0;
		}
	});
};

onBeforeUnmount(() => {
	renderList.stop();
	chapterIdWatch?.();
	directionValWatch?.();
});

const chapterIdWatch = watch(
	() => props.chapterId,
	newID => {
		// renderList.init(newID);
	},
	immediate,
);

const directionValWatch = watch(
	() => direction.value,
	newVal => {
		// 横向滚动需要在当前章节加载完成后再进行滚动条偏移
		if (newVal === 'horizontal') {
			renderList.onReadingChange = function () {
				scrollViewTop.value = 10;
				$_nextTick(() => {
					scrollViewTop.value = 0;
				});
			};
		} else if (!firstRender.value) {
			renderList.onReadingChange = void 0;
		}
	},
	immediate,
);
</script>

<template>
	<view
		id="novel_content"
		class="no-scrollbar full-size article-container"
		:class="[backgroundConfig, fontSizeConfig, direction]"
	>
		<template v-if="direction === 'horizontal'">
			<!-- 横向切页 -->
			<scroll-view
				class="full-size article-container-scroll-view overflow-compatiable-horizontal"
				scroll-y
				:scroll-anchoring="false"
				:scroll-top="scrollViewTop"
				:show-scrollbar="false"
			>
				<view
					v-if="renderList.nowRead"
					class="article-content-outer content-horizontal"
					:id="'chapter-content-horizontal-' + renderList.nowReadKey"
				>
					<ArticleContent :data="renderList.nowRead">
						<template #pageEnd="{ prev, next }">
							<view class="position-to-bottom operate-horizontal">
								<view class="buttons-of-horizontal">
									<button
										class="operate-horizontal-prev"
										:class="prev ? '' : 'disabled'"
										@click="prev ? renderList.previous() : void 0"
									>
										{{ prev ? '上一章' : '到顶了' }}
									</button>
									<button
										class="operate-horizontal-next"
										:class="next ? '' : 'disabled'"
										@click="next ? renderList.next() : void 0"
									>
										{{ next ? '下一章' : '到底了' }}
									</button>
								</view>
							</view>
						</template>
					</ArticleContent>
				</view>
			</scroll-view>
		</template>
		<template v-else>
			<!-- 竖向滚动 -->
			<scroll-view
				class="full-size article-container-scroll-view overflow-compatiable-vertical"
				scroll-y
				:scroll-anchoring="true"
				:scroll-top="firstRender ? 0 : 10"
				:show-scrollbar="false"
			>
				<template v-for="(item, index) in renderList.value" :key="'chapter-content-key-' + item.__key">
					<view class="article-content-outer content-vertical" :id="'chapter-content-vertical-' + item.__key">
						<ArticleContent :data="item">
							<template #pageStart>
								<view class="position-to-top"></view>
								<view :id="'chapter-content-vertical-child-' + item.__key"><!-- 定位元素 --></view>
							</template>
							<template #pageEnd="{ prev, next }">
								<view class="position-to-bottom operate-vertical"></view>
							</template>
						</ArticleContent>
					</view>
				</template>
			</scroll-view>
		</template>
	</view>
</template>

<style scoped lang="scss">
@use '../../style/scss/reading.scss' as R;
@import '../../style/scss/config/main.scss';

#novel_content.article-container {
	// 注入背景色
	@include R.backgroundColor();
	// 注入字体大小
	@include R.fontSize();

	.article-container-scroll-view {
		// 插槽
		.position-to-top {
			width: 100%;
			height: 10px;
		}

		.position-to-bottom {
			width: 100%;
			height: 200rpx;
		}
	}

	.article-content-outer {
		width: 100%;
		height: auto;
	}

	// 兼容overflow-anchor
	.overflow-compatiable-vertical {
		overflow-anchor: auto;
	}

	.overflow-compatiable-horizontal {
		overflow-anchor: none;
	}
}

#novel_content.article-container {
	.content-horizontal .operate-horizontal {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		margin-bottom: $wyg-spacing-col-lg;

		.buttons-of-horizontal {
			width: 70%;
			height: 75rpx;
			display: grid;
			grid-template-columns: repeat(2, min(40%, 400rpx));
			justify-content: space-around;

			button {
				width: 100%;
				height: 100%;
				line-height: 75rpx;
				padding: 0;
				background-color: $wyg-color-primary;
				color: $wyg-text-color-inverse;
				font-size: var(--paragraph);

				&:not(.disabled):active,
				&:not(.disabled).hover {
					background-color: $wyg-color-primary-hover;
				}

				&.operate-horizontal-prev.disabled,
				&.operate-horizontal-next.disabled {
					background-color: $wyg-color-primary-disabled;
				}
			}
		}
	}
}
</style>
