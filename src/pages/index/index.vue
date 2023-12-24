<template>
	<view class="full-screen content">
		<view class="search-container"></view>
		<view class="book-list">
			<view class="book" v-for="(item, index) in bookList" :key="'book-list-' + index"></view>
		</view>
	</view>
</template>

<script setup lang="ts">
import type { BookList } from './type';

/** 图书列表 */
const bookList = ref<BookList[]>([
	{
		name: 'test',
		href: '#',
	},
]);
</script>

<style scoped lang="scss">
@import '~@static/scss/config/main.scss';

.content {
	overflow: scroll;
	position: relative;
}

.search-container {
	width: 100%;
}
</style>
