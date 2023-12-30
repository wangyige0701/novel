<template>
	<view
		id="novel_content"
		class="full-size article-content-container"
		:class="[selectConfig ?? readStyleConfig.baixue.value, direction ?? 'vertical']"
	></view>
</template>

<script setup lang="ts">
import type { ArticleReturnVal } from '@/regular/@types/article';
import { type ReadStyleConfig, readStyleConfig, readStyleConfigList } from './data/readStyle';
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

.article-content-container {
	display: flex;

	&.vertical {
		flex-direction: column;
	}

	&.horizontal {
		flex-direction: row;
	}
}
</style>
