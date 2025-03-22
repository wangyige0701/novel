<template>
	<Page class="flex flex-col justify-start items-center container">
		<Search :back="false" />
		<view class="width-full flex flex-col flex-1 content bookshelf">
			<view class="width-full">
				<template v-for="(item, index) of bookshelf" :key="item.id + '-' + index">
					<view class="width-full flex flex-row flex-nowrap bookshelf_item" @click.stop="select(item)">
						<view class="height-full book_left">
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
		<radio-group @change="changeRadio">
			<label v-for="(item, index) of test" :key="index">
				<radio :value="item.name" :checked="item.name === 'tip'" />
				<view>{{ item.name }}</view>
			</label>
		</radio-group>
		<button @click="useTest">打开</button>
	</Page>
</template>

<script setup lang="ts">
import type { BookItemInfo } from '@/@types/pages';
import Page from '@/components/Page.vue';
import Search from '@/components/Search.vue';
import Image from '@/components/Image.vue';
import { Path } from '@/common/path';
import { Pages } from '@/config/pages';
import { useInteractStore } from '@/store/interact';
import BookInfo from '@/components/pages/index/BookInfo.vue';

backInteract();
const interactStore = useInteractStore();
const bookshelf = shallowReactive<BookItemInfo[]>([
	{
		id: '1',
		name: '书籍1',
		img: 'https://picsum.photos/70/90',
		author: '作者1',
		description: Array.from({ length: 100 })
			.map(() => '书籍1的描述')
			.join(''),
	},
]);

function select(e: BookItemInfo) {
	console.log(e);
}

function operate(e: BookItemInfo) {}

const current = ref(0);
const test = [
	{
		name: 'tip',
	},
	{
		name: 'popup',
	},
	{
		name: 'modal',
	},
	{
		name: 'loading',
	},
];
function changeRadio(e: any) {
	const index = test.findIndex(item => item.name === e.detail.value);
	current.value = index;
}
function useTest() {
	const target = test[current.value]?.name;
	const { popup, tip, modal, loading } = interactStore;
	if (target === 'popup') {
		popup({
			title: '提示',
			button: false,
		});
	} else if (target === 'tip') {
		tip.warning({
			message: '功能开发中',
			position: 'stick-top',
		});
	} else if (target === 'modal') {
		modal({
			title: '提示',
			message: '功能开发中',
		})
			.then(res => {
				console.log(res);
			})
			.catch(err => {
				console.log(err);
			});
	} else if (target === 'loading') {
		loading({
			duration: 2000,
		});
	}
}
</script>

<style scoped lang="scss">
@use '@/style/index.scss' as Scss;

.bookshelf {
	gap: Scss.$gap-base;
	overflow-y: scroll;
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
	overflow: hidden;
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
