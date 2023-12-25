<template>
	<view class="full-screen content">
		<view class="search-container"></view>
		<view class="book-list">
			<BookList v-if="showType === 'bookList'" :book-list="testData" @click="bookHomepage"></BookList>
		</view>
	</view>
</template>

<script setup lang="ts">
import BookList from '@comp/list/bookList.vue';
import { data as testData } from '@test/data/bookList.test';

const showType = ref<'bookList' | 'searchList'>('bookList');

function bookHomepage(item: BookListClickType) {
	console.log(item);
}
</script>

<style scoped lang="scss">
@import '../../static/scss/config/main.scss';

.content {
	overflow: scroll;
	position: relative;
}

.search-container {
	width: 100%;
	height: $wyg-search-bar-height;
}
</style>
