<template>
	<view
		id="novel_content"
		class="no-scrollbar full-size article-container"
		:class="[selectConfig, direction ?? 'vertical']"
	>
		<!-- <ArticleContent :data="testData"></ArticleContent> -->
		<view v-for="(item, index) in renderList.value" :key="'test' + index">{{ item.toString() }}</view>
	</view>
</template>

<script setup lang="ts">
import type { ArticleReturnVal } from '@/regular/@types/article';
import { type ReadStyleConfig, readStyleConfig, readStyleConfigList } from './data/readStyle';
import ArticleContent from './content.vue';
import { SettingAtricleCaches } from './data/articlesCache';
import { articleContent as testData } from '@test/data/article.test';

interface Props {
	bookId: string;
	bookName: string;
}

const renderList = new SettingAtricleCaches();
/** 选择的配置 */
const selectConfig = ref<ReadStyleConfig>('baixue');
/** 翻看方向 */
const direction = ref<'vertical' | 'horizontal'>('vertical');

const props = defineProps<Props>();
</script>

<style scoped lang="scss">
@import '../../static/scss/reading.scss';

#novel_content.article-container {
	display: flex;
	overflow: scroll;

	&.vertical {
		flex-direction: column;
	}

	&.horizontal {
		flex-direction: row;
	}
}
</style>
