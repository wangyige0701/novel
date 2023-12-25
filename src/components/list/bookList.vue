<template>
	<view v-if="!props.bookList || props.bookList.length === 0" :class="props.placeholder"></view>
	<view v-else class="container">
		<view class="book" v-for="(item, index) in props.bookList" :key="'book-list-' + index" @click="onClick(item)">
			<view v-if="item.img" class="book-image">
				<image :src="item.img" mode="scaleToFill" />
			</view>
			<view v-else class="image-placeholder"></view>
			<view class="book-info">
				<view class="text-ellipsis book-name">
					<text>{{ item.name }}</text>
				</view>
				<view class="text-ellipsis book-type">
					<text>{{ item.type }}</text>
				</view>
				<view class="text-ellipsis book-author">
					<text>{{ item.author }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
interface Props {
	/** 图书列表 */
	bookList: Array<BookListType>;
	/** 没有图书数据时的类名，默认是placeholder */
	placeholder?: string;
}

interface Emits {
	(e: 'click', value: BookListClickType): void;
}

const props = withDefaults(defineProps<Props>(), {
	bookList: () => [],
	placeholder: 'placeholder',
});

const emit = defineEmits<Emits>();

/**
 * 点击书籍
 * @param item
 */
function onClick(item: BookListType) {
	emit('click', {
		name: item.name,
		href: item.href,
	});
}
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
	grid-template-columns: 1fr;
	grid-auto-rows: 350rpx;
	gap: 20rpx;
	justify-items: center;
	padding: 20rpx;
}

.book {
	width: 100%;
	height: 250rpx;
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	align-items: center;
	justify-content: flex-start;
	overflow: hidden;

	@media screen and (min-width: 1024px) {
		width: 60%;
	}

	.book-image,
	.image-placeholder {
		width: 150rpx;
		height: 200rpx;
		border-radius: $wyg-border-radius-base;
		overflow: hidden;
	}

	.book-image {
		background-color: red;
	}

	.image-placeholder {
		background-color: hotpink;
	}

	.book-info {
		height: 160rpx;
		flex: 1;
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		align-items: flex-start;
		justify-content: space-evenly;
		margin-left: 20rpx;

		> .book-name {
			height: 60rpx;
			line-height: 60rpx;
			font-weight: bold;
			font-size: $wyg-font-size-title;
			color: $wyg-color-title;
		}

		> .book-type,
		> .book-author {
			height: 40rpx;
			line-height: 40rpx;
			font-size: $wyg-font-size-subtitle;
			color: $wyg-color-subtitle;
			padding-left: 10rpx;
		}
	}
}
</style>
