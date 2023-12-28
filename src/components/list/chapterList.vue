<template>
	<view class="full-size chapter-list-container">
		<view class="list-item"></view>
	</view>
</template>

<script setup lang="ts">
import type { HomePageReturnVal, ChapterList } from '@/regular/@types/homepage';
import { chapterList } from '@/regular/index';
import { homePageData as testData } from '@test/data/homepage.test';

interface Props {
	bookId: string;
	bookName: string;
}

/** 渲染列表 */
const renderList: ChapterList = shallowReactive<ChapterList>([]);

const renderData = testData as HomePageReturnVal;

const props = withDefaults(defineProps<Props>(), {
	bookId: '',
	bookName: '',
});

const listRefresh = {
	clear() {
		renderList.splice(0, renderList.length);
	},

	insert(val: ChapterList) {
		for (const item of val) {
			renderList.push(Object.freeze(item));
		}
	},
};

function requestChapterList(id: string) {}
</script>

<style scoped lang="scss">
.chapter-list-container {
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;

	.list-item:not(:last-child) {
		margin-bottom: 20rpx;
	}
}
</style>
