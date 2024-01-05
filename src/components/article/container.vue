<template>
	<view
		id="novel_content"
		class="no-scrollbar full-size article-container"
		:class="[backgroundConfig, fontSizeConfig, direction]"
	>
		<template v-if="direction === 'horizontal'">
			<!-- 横向切页 -->
			<view class="full-size">
				<ArticleContent></ArticleContent>
			</view>
		</template>
		<template v-else>
			<!-- 竖向滚动 -->
			<scroll-view
				class="full-size overflow-compatiable"
				scroll-y
				:scroll-anchoring="true"
				:scroll-top="firstRender ? 0 : 10"
			>
				<template v-for="(item, index) in renderList.value" :key="'chapter-content-key-' + item.__key">
					<view class="contetn-vertical" :id="'chapter-content-key-' + item.__key">
						<ArticleContent :data="item">
							<template #pageStart>
								<view class="position-to-top"></view>
								<view :id="'chapter-content-child-key-' + item.__key">
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
import type { ArticleReturnVal } from '@/regular/@types/article';
import { SettingAtricleCaches } from './data/articlesCache';
import { $_nextTick } from '@/utils/nextTick';

import ArticleContent from './content.vue';

interface Props {
	chapterId: string;
	chapterName: string;
}

/** 渲染列表 */
const renderList = new SettingAtricleCaches(1);
/** 判断是否是首次加载，用于进行初始数据加载完成后的滚动条偏移 */
const firstRender = ref(true);
/** 背景色的配置 */
const backgroundConfig = ref<ArticlebackgroundConfig>('baixue');
/** 字号的配置 */
const fontSizeConfig = ref<ArticleSizeConfig>('base');
/** 翻看方向 */
const direction = ref<'vertical' | 'horizontal'>('vertical');

const props = defineProps<Props>();

onBeforeUnmount(() => {
	renderList.stop();
});

watch(
	() => props.chapterId,
	newID => {
		// renderList.init(newID);
	},
	{
		immediate: true,
	},
);

renderList.onReadingChange = function (val: ArticleReturnVal & { __key: string }) {
	// 页面初始加载时滚动一次，防止滚动条移位
	$_nextTick(() => {
		if (val && firstRender.value) {
			firstRender.value = false;
			renderList.onReadingChange = void 0;
		}
	});
};
</script>

<style scoped lang="scss">
@use '../../static/scss/reading.scss' as R;

#novel_content.article-container {
	// 注入背景色
	@include R.backgroundColor();
	// 注入字体大小
	@include R.fontSize();

	// 兼容overflow-anchor
	.overflow-compatiable {
		overflow-anchor: auto;
	}
}

#novel_content.article-container {
	.contetn-vertical[id*=' chapter-content-key-'],
	.contetn-vertical[id^='chapter-content-key-'] {
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
