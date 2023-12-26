<template>
	<view class="full-screen content">
		<StatusBar color="red">
			<template v-slot:statusBar>
				<view class="status-bar search-container"></view>
			</template>
		</StatusBar>
		<view class="book-list">
			<BookList v-if="showType === 'bookList'" :book-list="testData" @click="bookHomepage"></BookList>
		</view>
	</view>
</template>

<script setup lang="ts">
import StatusBar from '@comp/statusBar/index.vue';
import BookList from '@comp/list/bookList.vue';
import { data as testData } from '@test/data/bookList.test';
import { path } from '@path/index';

const showType = ref<'bookList' | 'searchList'>('bookList');

/** 跳转主页 */
function bookHomepage(item: BookListClickType) {
	path.navigateTo({
		url: '/pages/home/index',
		params: {
			bookId: item.href,
		},
	});
}

path.navigateTo({
	url: '/pages/home/index',
	params: {
		bookId: '/b5738/',
	},
});
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
	background-color: red;
}
</style>
