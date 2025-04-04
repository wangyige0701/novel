<template>
	<Page class="width-full height-full">
		<view class="width-full height-full scroll-y reading">
			<view class="width-full content" v-html="unref(content)"></view>
			<view class="width-full flex flex-row flex-nowrap operate">
				<text class="flex-1 flex flex-center change" @click="remove">上一章</text>
				<text class="flex-1 flex flex-center change" @click="add">下一章</text>
			</view>
		</view>
	</Page>
</template>

<script setup lang="ts">
import { unref } from 'vue';
import { getReading } from '@/common/reading';
import Page from '@/components/Page.vue';
import Test from '@/database/Test';
import { TestModel } from '@/model/Test';
import { randomString } from '@wang-yige/utils';

backInteract();
const { page, content, loading } = getReading();

const test = new Test();
const testModel = new TestModel();

async function add() {
	console.log(test.id, test.name, test.gender);
	const result = await testModel.all();
	const a = await test.insertMulti([
		{
			name: 'test' + result.length,
			gender: result.length % 2,
			idCard: randomString(10),
		},
		{
			name: 'test' + (result.length + 1),
			gender: result.length % 2,
			idCard: randomString(10),
		},
	]);
	console.log(a);
	console.log(await testModel.all());
}

async function remove() {
	const result = await testModel.all();
	console.log(result);
	const first = result[0];
	if (first) {
		const a = await test.delete(first?.id);
		console.log(a);
	} else {
		console.log('没有数据');
	}
}
</script>

<style scoped lang="scss">
@use '@/style/index.scss' as Scss;

.reading {
	--operate: 150rpx;
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
