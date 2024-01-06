<template>
	<view
		id="novel_content"
		class="no-scrollbar full-size article-container"
		:class="[backgroundConfig, fontSizeConfig, direction]"
	>
		<template v-if="direction === 'horizontal'">
			<!-- 横向切页 -->
			<scroll-view
				class="full-size overflow-compatiable-horizontal"
				scroll-y
				:scroll-anchoring="false"
				:scroll-top="scrollViewTop"
			>
				<view class="full-size" :id="'chapter-content-horizontal-' + renderList.nowReadKey">
					<ArticleContent :data="renderList.nowRead"></ArticleContent>
				</view>
			</scroll-view>
		</template>
		<template v-else>
			<!-- 竖向滚动 -->
			<scroll-view
				class="full-size overflow-compatiable-vertical"
				scroll-y
				:scroll-anchoring="true"
				:scroll-top="firstRender ? 0 : 10"
			>
				<template v-for="(item, index) in renderList.value" :key="'chapter-content-key-' + item.__key">
					<view class="contetn-vertical" :id="'chapter-content-vertical-' + item.__key">
						<ArticleContent :data="item">
							<template #pageStart>
								<view class="position-to-top"></view>
								<view :id="'chapter-content-vertical-child-' + item.__key">
									<!-- 定位元素 -->
								</view>
							</template>
							<template #pageEnd="{ prev, next }">
								<view class="position-to-bottom" :class="'operate-' + direction"></view>
							</template>
						</ArticleContent>
					</view>
				</template>
			</scroll-view>
		</template>
	</view>
</template>

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
const direction = ref<ReadingDirectionVariables>(/* readingDirection */ 'horizontal');

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
});

watch(
	() => props.chapterId,
	newID => {
		// renderList.init(newID);
	},
	immediate,
);

watch(
	() => direction.value,
	newVal => {
		if (newVal === 'horizontal') {
			renderList.onReadingChange = function (val: ArticleReturnVal & { __key: string }) {
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

<style scoped lang="scss">
@use '../../style/scss/reading.scss' as R;

#novel_content.article-container {
	// 注入背景色
	@include R.backgroundColor();
	// 注入字体大小
	@include R.fontSize();

	// 兼容overflow-anchor
	.overflow-compatiable-vertical {
		overflow-anchor: auto;
	}

	.overflow-compatiable-horizontal {
		overflow-anchor: none;
	}
}

#novel_content.article-container {
	.contetn-vertical[id*=' chapter-content-vertical-'],
	.contetn-vertical[id^='chapter-content-vertical-'] {
		width: 100%;
		height: auto;

		&.hidden {
			display: none;
		}

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
}
</style>
