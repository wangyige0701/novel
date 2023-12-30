<template>
	<view class="full-size article-content-container" :class="[selectConfig ?? readStyleConfig.baixue.value]"></view>
</template>

<script setup lang="ts">
import type { ArticleReturnVal } from '@/regular/@types/article';
import { type ReadStyleConfig, readStyleConfig, readStyleConfigList } from './data/readStyle';

interface Props {
	bookId: string;
	bookName: string;
}

/** 缓存前后章节的列表 */
const cacheArticleContents: ArticleReturnVal[] = [];
/** 选择的配置 */
const selectConfig = ref<ReadStyleConfig>('baixue');

const props = defineProps<Props>();
</script>

<style scoped lang="scss">
.article-content-container {
}
</style>
