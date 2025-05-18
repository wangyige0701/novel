<template>
	<Page class="full">
		<view class="full scroll-y reading">
			<view>
				<view class="width-full title">
					<text>{{ data.title }}</text>
				</view>
				<view class="width-full content">
					<template v-for="(item, index) of data.contents" :key="index">
						<p class="paragraph">{{ item }}</p>
					</template>
				</view>
			</view>
			<view class="width-full flex flex-row flex-nowrap operate">
				<text class="flex-1 flex flex-center change" @click="prev">上一章</text>
				<text class="flex-1 flex flex-center change" @click="next">下一章</text>
			</view>
		</view>
	</Page>
</template>

<script setup lang="ts">
import { getReading } from '@/common/reading';
import Page from '@/components/Page.vue';
import { useInteractStore } from '@/store/interact';
import { Fn } from '@wang-yige/utils';

backInteract();
const { closeWatch, data } = await getReading();

let closeLoading: { close: Fn } & {};
watch(
	() => data.loading,
	newValue => {
		if (newValue) {
			closeLoading = useInteractStore().loading();
		} else {
			closeLoading && closeLoading.close();
		}
	},
);

async function prev() {
	await data.prev();
}

async function next() {
	await data.next();
}

onBeforeUnmount(() => {
	closeWatch && closeWatch();
});
</script>

<style scoped lang="scss">
@use '@/style/index.scss' as Scss;

.reading {
	--operate: 150rpx;
}
.title {
	line-height: 2em;
	margin: 0 auto;
}
.content {
	min-height: calc(100% - var(--operate));
	color: Scss.$text-color;
	font-size: Scss.$font-xl;
}
.operate {
	height: var(--operate);
	.change {
		color: Scss.$text-color;
		font-size: Scss.$font-lg;
		&:active {
			background-color: Scss.$info-lightly-color;
		}
	}
}
</style>
