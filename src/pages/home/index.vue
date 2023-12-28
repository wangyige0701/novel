<template>
	<StatusBar color="transparent" :full="true">
		<template #statusBar="{ height }">
			<view class="content">
				<view class="no-scrollbar container">
					<view class="info">
						<BookInfo :bookId="bookId"></BookInfo>
					</view>
					<view class="list">
						<!-- 章节列表 -->
					</view>
				</view>
			</view>
		</template>
	</StatusBar>
</template>

<script setup lang="ts">
import StatusBar from '@comp/statusBar/index.vue';
import BookInfo from '@comp/info/book.vue';

const bookId = ref('');

onLoad(options => {
	if (!options) {
		return;
	}
	const { bookId: id } = options;
	bookId.value = id;
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
	}
}
</style>
