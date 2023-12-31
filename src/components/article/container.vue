<template>
	<view
		id="novel_content"
		class="no-scrollbar full-size article-container"
		:class="[selectConfig, direction ?? 'vertical']"
	>
		<template v-for="(item, index) in renderList.value" :key="'chapter-content-key-' + item.__key">
			<ArticleContent :data="item">
				<template #operate></template>
			</ArticleContent>
		</template>
	</view>
</template>

<script setup lang="ts">
import { type ReadStyleConfig, readStyleConfig, readStyleConfigList } from './data/readStyle';
import ArticleContent from './content.vue';
import { SettingAtricleCaches } from './data/articlesCache';
// import { articleContent as testData } from '@test/data/article.test';

interface Props {
	chapterId: string;
	chapterName: string;
}

/** 渲染列表 */
const renderList = new SettingAtricleCaches();
/** 选择的配置 */
const selectConfig = ref<ReadStyleConfig>('baixue');
/** 翻看方向 */
const direction = ref<'vertical' | 'horizontal'>('vertical');

const props = defineProps<Props>();

onBeforeUnmount(() => {
	renderList.stop();
});

watch(
	() => props.chapterId,
	newID => {
		renderList.init(newID);
	},
	{
		immediate: true,
	},
);
</script>

<style scoped lang="scss">
@import '../../static/scss/reading.scss';

#novel_content.article-container {
	display: flex;
	overflow: scroll;
	overflow-anchor: auto;

	&.vertical {
		flex-direction: column;
	}

	&.horizontal {
		flex-direction: row;
	}
}
</style>
