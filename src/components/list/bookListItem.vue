<template>
	<view class="book-list-item-container">
		<view class="show">
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
		<view class="delete"></view>
	</view>
</template>

<script lang="ts">
import type { PropType } from 'vue';

let observer: UniApp.IntersectionObserver;

export default defineComponent({
	name: 'bookListItem',
	props: {
		item: {
			type: Object as PropType<BookListType>,
			required: true,
		},
	},
	emits: {
		click(value: BookListClickType) {
			return 'name' in value && 'href' in value;
		},
	},
	mounted() {
		this.observeScroll();
	},
	methods: {
		emitClick(item: BookListType) {
			this.$emit('click', {
				name: item.name,
				href: item.href,
			});
		},
		observeScroll() {
			observer = uni.createIntersectionObserver(this);
			observer.relativeTo('.book-list-item-container', { right: 0 }).observe('.delete', res => {
				console.log(res);
			});
		},
	},
});
</script>

<style scoped lang="scss">
@import '../../static/scss/config/main.scss';

/* #ifdef H5 */
.book-list-item-container::-webkit-scrollbar {
	display: none;
}
/* #endif */

.book-list-item-container {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	align-items: center;
	overflow-y: hidden;
	overflow-x: scroll;
	scroll-snap-type: x mandatory;

	> * {
		flex-shrink: 0;
		scroll-snap-align: start;
		scroll-snap-stop: always;
	}

	.show {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
		justify-content: flex-start;
		overflow: hidden;
	}

	.delete {
		width: 140rpx;
		height: 170rpx;
		background-color: red;
		margin-left: 20rpx;
	}
}

.book-list-item-container .show {
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
