<template>
	<view id="novel_content" class="full-size article-container" :class="[selectConfig, direction ?? 'vertical']">
		<ArticleContent :data="testData"></ArticleContent>
	</view>
</template>

<script setup lang="ts">
import type { ArticleReturnVal } from '@/regular/@types/article';
import { type ReadStyleConfig, readStyleConfig, readStyleConfigList } from './data/readStyle';
import ArticleContent from './content.vue';
import { articleContent as testData } from '@test/data/article.test';

interface Props {
	bookId: string;
	bookName: string;
}

/** 缓存前后章节的列表 */
const cacheArticleContents: ArticleReturnVal[] = [];
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
