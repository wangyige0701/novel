<template>
	<Page class="flex flex-col justify-start items-center container">
		<Search v-model:model-value="searchContent" />
		<view class="width-full flex flex-col flex-1 hidden content">
			<view class="search_tip">
				<text>搜索结果</text>
				<text class="search_result_num">{{ searchResult.length }}</text>
				<text>条</text>
			</view>
			<view class="flex flex-col flex-1 scroll-y search_list">
				<template v-for="(item, index) of searchResult" :key="index">
					<view class="flex flex-row flex-nowrap search_item">
						<view class="hidden book_left">
							<Image class="full" :src="item.img" mode="heightFix"></Image>
						</view>
						<view class="flex flex-col justify-evenly flex-1">
							<text class="text-ellipsis book_title">{{ item.name }}</text>
							<text class="text-ellipsis book_author">{{ item.author }}</text>
							<text class="text-ellipsis book_desc">{{ item.description }}</text>
						</view>
					</view>
				</template>
			</view>
		</view>
	</Page>
</template>

<script setup lang="ts">
import type { SearchBookInfo } from '@/@types/pages/search';
import Page from '@/components/Page.vue';
import Search from '@/components/Search.vue';
import Image from '@/components/Image.vue';
import { useBookshelf } from '@/store/bookshelf';
import { useInteractStore } from '@/store/interact';

backInteract();
const searchContent = ref('');
const searchResult = shallowReactive<SearchBookInfo[]>([]);

watch(
	searchContent,
	async newValue => {
		if (newValue) {
			const state = useInteractStore().loading();
			const Bookshelf = useBookshelf().current;
			const results = await new Bookshelf().search(newValue).catch(() => []);
			searchResult.length = 0;
			searchResult.push(...results);
			state.close();
		} else {
			searchResult.length = 0;
		}
	},
	{ immediate: true },
);

watch(
	() => useBookshelf().current,
	() => {
		searchContent.value = '';
	},
);

onLoad(options => {
	const { search = '' } = options || {};
	searchContent.value = search;
});
</script>

<style scoped lang="scss">
@use 'sass:math';
@use '@/style/index.scss' as Scss;

.content {
	padding: 0;
}

.search_tip {
	font-size: Scss.$font-base;
	color: Scss.$text-secondary-color;
	line-height: Scss.$font-base * 2;
	padding: 0 Scss.$gap-base;
	.search_result_num {
		color: Scss.$error-color;
		padding: 0 math.div(Scss.$gap-base, 2);
	}
}

.search_list {
	gap: Scss.$gap-base;
	padding: Scss.$gap-base;
}

.search_item {
	height: 200rpx;
	color: Scss.$text-normal-color;
	font-size: Scss.$font-lg;
	gap: Scss.$gap-base;
	padding: 5px;
	box-shadow: 0 0 5px Scss.$text-placeholder-color;
	border-radius: Scss.$border-radius-base;
	transition: box-shadow 0.1s ease;
	&:active {
		box-shadow: 0 0 5px Scss.$warning-hover-color;
	}
	.book_title {
		font-size: Scss.$font-xl;
		color: Scss.$text-color;
		line-height: Scss.$font-xl * 1.8;
	}
	.book_author,
	.book_desc {
		line-height: Scss.$font-xl * 1.5;
	}
}

.book_left {
	width: 140rpx;
	border-radius: Scss.$border-radius-base;
}
</style>
