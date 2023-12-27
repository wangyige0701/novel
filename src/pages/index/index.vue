<template>
	<StatusBar color="red" :full="true" @click="globalClick">
		<template #statusBar>
			<view class="content">
				<view class="search-container"></view>
				<view class="book-list">
					<BookList v-if="showType === 'bookList'" :book-list="testData" @click="bookHomepage"></BookList>
				</view>
			</view>
		</template>
	</StatusBar>
</template>

<script setup lang="ts">
import StatusBar from '@comp/statusBar/index.vue';
import BookList from '@comp/list/bookList.vue';
import { data as testData } from '@test/data/bookList.test';
import { path } from '@path/index';

const showType = ref<'bookList' | 'searchList'>('bookList');

/** 跳转主页 */
function bookHomepage(item: BookListClickType) {
	// path.navigateTo({
	// 	url: '/pages/home/index',
	// 	params: {
	// 		bookId: item.href,
	// 	},
	// });
}

function globalClick() {
	console.log(1);
}

// path.navigateTo({
// 	url: '/pages/home/index',
// 	params: {
// 		bookId: '/b5738/',
// 	},
// });
</script>

<style scoped lang="scss">
@import '../../static/scss/config/main.scss';

.content {
	width: 100%;
	height: 100%;
	overflow: scroll;
}

.search-container {
	width: 100%;
	height: $wyg-search-bar-height;
	background-color: red;
	position: sticky;
	top: 0;
}
</style>
