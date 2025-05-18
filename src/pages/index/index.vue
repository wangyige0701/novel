<template>
	<Page class="flex flex-col justify-start items-center container">
		<Search :back="false" />
		<view class="width-full flex flex-col flex-1 content scroll-y bookshelf">
			<view class="width-full">
				<template v-for="(item, index) of bookshelf" :key="item.id + '-' + index">
					<view class="width-full flex flex-row flex-nowrap bookshelf_item" @click.stop="select(item)">
						<view class="height-full hidden book_left">
							<Image class="full" :src="item.img" mode="heightFix" />
						</view>
						<view class="flex flex-col justify-evenly flex-1 hidden">
							<view class="flex flex-row flex-nowrap items-center book_right_top">
								<text class="flex-1 text-ellipsis">{{ item.name }}</text>
								<text class="flex flex-center book_operate" @click.stop="operate(item)">
									<text class="icon-operate"></text>
								</text>
							</view>
							<view class="flex book_right_center">
								<text class="flex-1 text-ellipsis">{{ item.author }}</text>
							</view>
							<view class="flex book_right_bottom">
								<text class="flex-1 text-ellipsis">{{ item.description }}</text>
							</view>
						</view>
					</view>
				</template>
			</view>
		</view>
	</Page>
</template>

<script setup lang="ts">
import type { BookItemInfo } from '@/@types/pages';
import { Path } from '@/common/path';
import { Pages } from '@/config/pages';
import { useInteractStore } from '@/store/interact';
import { VOID_FUNCTION } from '@wang-yige/utils';
import { useBookshelf } from '@/store/bookshelf';
import Page from '@/components/Page.vue';
import Search from '@/components/Search.vue';
import Image from '@/components/Image.vue';
import BookInfo from '@/components/pages/index/BookInfo.vue';

backInteract();
const bookshelf = shallowReactive<BookItemInfo[]>([]);

function select(e: BookItemInfo) {
	const Bookshelf = useBookshelf().current;
	new Bookshelf().select(e.id);
	Path.navigateTo(Pages.Reading);
}

function operate(e: BookItemInfo) {
	const { popup } = useInteractStore();
	popup({
		component: BookInfo,
		componentProps: {
			...e,
			onRemove: remove,
		},
		direction: 'bottom',
	}).catch(VOID_FUNCTION);
}

async function remove(data: BookItemInfo) {
	const { loading, modal } = useInteractStore();
	const select = await modal({
		title: '提示',
		message: `确定要删除【${data.name}】吗？`,
	})
		.then(() => true)
		.catch(() => false);
	if (!select) {
		return;
	}
	const state = loading();
	const Bookshelf = useBookshelf().current;
	const bs = new Bookshelf();
	await bs.remove(data.id);
	state.close();
}

async function init() {
	const Bookshelf = useBookshelf().current;
	const bs = new Bookshelf();
	await bs.init().catch(VOID_FUNCTION);
	bookshelf.splice(0, bookshelf.length, ...bs.datas);
}

onBeforeMount(async () => {
	const state = useInteractStore().loading();
	await init();
	state.close();
});
</script>

<style scoped lang="scss">
@use '@/style/index.scss' as Scss;

.bookshelf {
	gap: Scss.$gap-base;
	.bookshelf_item {
		height: 200rpx;
		gap: Scss.$gap-base;
		border-radius: Scss.$border-radius-base;
		box-shadow: 0 0 5px Scss.$text-placeholder-color;
		padding: 5px;
		transition: box-shadow 0.1s ease;
		&:active {
			box-shadow: 0 0 5px Scss.$warning-hover-color;
		}
	}
}

.book_left {
	width: 140rpx;
	border-radius: Scss.$border-radius-base;
}

.book_right_top {
	font-size: Scss.$font-xl;
	line-height: Scss.$font-xl * 1.8;
	color: Scss.$black;
	.book_operate {
		width: 50rpx;
		padding: 10rpx;
		color: Scss.$text-normal-color;
		transform: rotate(90deg);
	}
}

.book_right_center,
.book_right_bottom {
	font-size: Scss.$font-lg;
	line-height: Scss.$font-xl * 1.5;
	color: Scss.$text-normal-color;
}
</style>
