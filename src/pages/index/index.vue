<template>
	<view class="full-screen content">
		<view class="search-container"></view>
		<view class="book-list">
			<BookList v-if="showType === 'bookList'"></BookList>
		</view>
	</view>
</template>

<script setup lang="ts">
import BookList from '@comp/list/bookList.vue';

const showType = ref<'bookList' | 'searchList'>('bookList');
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
