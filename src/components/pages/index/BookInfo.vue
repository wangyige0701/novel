<template>
	<view class="full flex flex-row flex-nowrap">
		<view class="h-full book_img">
			<Image class="full img_box" :src="props.img" mode="widthFix" />
		</view>
		<view class="h-full flex flex-col flex-1 book_info">
			<view class="flex flex-row justify-end">
				<text class="icon-delete remove_book" @click="remove(`${props.id}`)"></text>
			</view>
			<view class="flex flex-col">
				<text class="text-ellipsis book_name">{{ props.name }}</text>
				<text class="text-ellipsis book_author">{{ props.author }}</text>
			</view>
			<view class="h-full flex-1 scroll-y book_desc">
				<text>{{ props.description }}</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import type { Book } from '@/@types/pages/index';
import Image from '@/components/Image.vue';

const props = defineProps<Book>();
const emit = defineEmits<{
	(e: 'remove', id: string): void;
}>();

function remove(id: string) {
	emit('remove', id);
}
</script>

<style scoped lang="scss">
@use '@/style/index.scss' as Scss;

.book_img {
	width: 160rpx;
	padding: 10rpx;
	.img_box {
		border-radius: 10rpx;
		overflow: hidden;
	}
}

.book_info {
	padding: 10rpx;
}

.remove_book {
	font-size: Scss.$font-xl;
	color: Scss.$error-color;
	&:active {
		color: Scss.$error-lightly-color;
	}
}

.book_name {
	font-size: Scss.$font-xl;
	line-height: Scss.$font-xl * 1.5;
	color: Scss.$text-color;
}

.book_author {
	font-size: Scss.$font-base;
	line-height: Scss.$font-base * 1.5;
	color: Scss.$text-normal-color;
}

.book_desc {
	font-size: Scss.$font-lg;
	color: Scss.$text-normal-color;
	margin-top: 10rpx;
}
</style>
