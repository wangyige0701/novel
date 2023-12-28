<template>
	<StatusBar color="transparent" :full="true">
		<template #statusBar="{ height }">
			<view class="content">
				<view class="no-scrollbar container">
					<view class="info">
						<BookInfo :book-id="bookId" :book-name="bookName"></BookInfo>
					</view>
					<view class="list">
						<view class="no-scrollbar list-container">
							<ChapterList :book-id="bookId" :book-name="bookName"></ChapterList>
						</view>
					</view>
				</view>
			</view>
		</template>
	</StatusBar>
</template>

<script setup lang="ts">
import StatusBar from '@comp/statusBar/index.vue';
import BookInfo from '@comp/info/book.vue';
import ChapterList from '@comp/list/chapterList.vue';

const bookId = ref('');
const bookName = ref('');

onLoad(options => {
	if (!options) {
		return;
	}
	const { bookId: id, bookName: name } = options;
	bookId.value = id;
	bookName.value = name;
});
</script>

<style scoped lang="scss">
.content {
	width: 100%;
	height: 100%;
}

.container {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	align-items: center;
	overflow-y: scroll;
	scroll-snap-type: y proximity;

	> * {
		flex-shrink: 0;
		scroll-snap-align: start;
		scroll-snap-stop: always;
	}

	.info {
		width: 100%;
		height: 400rpx;

		@media screen and (min-width: 1024px) {
			width: 70%;
		}
	}

	.list {
		width: 100%;
		min-height: calc(100% - 400rpx);

		.list-container {
			width: 80%;
			height: 100%;
			margin: 0 auto;
			box-sizing: border-box;
			padding-top: 20rpx;
			overflow: scroll;

			@media screen and (min-width: 1024px) {
				width: 60%;
			}
		}
	}
}
</style>
