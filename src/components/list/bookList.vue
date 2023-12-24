<template>
	<view v-if="!props.bookList || props.bookList.length === 0" :class="props.placeholder"></view>
	<view v-else class="container">
		<view class="book" v-for="(item, index) in props.bookList" :key="'book-list-' + index">
			<view v-if="item.img" class="image">
				<image :src="item.img" mode="scaleToFill" />
			</view>
			<view v-else class="image-placeholder"></view>
			<view class="name">
				<text>{{ item.name }}</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
interface Props {
	/** 图书列表 */
	bookList?: Array<BookList>;
	/** 没有图书数据时的类名，默认是placeholder */
	placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
	bookList: () => [],
	placeholder: 'placeholder',
});
</script>

<style scoped lang="scss">
@import '../../static/scss/config/main.scss';

.placeholder {
	width: 100%;
	height: 100%;
	background-color: grey;
}

.container {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200rpx, 1fr));
	grid-auto-rows: 350rpx;
	gap: 20rpx;
	padding: 20rpx;
}

.book {
	width: 100%;
	height: 350rpx;
	overflow: hidden;

	.image,
	.image-placeholder {
		width: 90%;
		height: 250rpx;
		margin: 0 auto;
		border-radius: $wyg-border-radius-base;
		overflow: hidden;
	}

	.image {
		background-color: red;
	}

	.image-placeholder {
		background-color: hotpink;
	}

	.name {
		width: 85%;
		height: 50rpx;
		line-height: 50rpx;
		margin: 20rpx auto 0 auto;
		text-align: center;
		font-size: $wyg-font-size-lg;
		color: $wyg-color-title;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
}
</style>
