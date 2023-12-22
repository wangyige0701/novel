<template>
	<view class="content">
		<text>{{ req }}</text>
		<text>abcdefg</text>
	</view>
</template>

<script setup lang="ts">
import { getListData } from '@/regular/dingdian/list';
import { getHomepageData } from '@/regular/dingdian/homepage';
import { getArticleData } from '@/regular/dingdian/article';

const req = ref('');

getListData('斗破苍穹', 'desc')
	.then(res => {
		// console.log(res);
		const href = res[0].value[3].href;
		return getHomepageData(href, (data, err) => {
			if (err) {
				console.log(err);
				return;
			}
		});
	})
	.then(res => {
		console.log(res);
		const href = res.chaptersList[0].href;
		return getArticleData(href!);
	})
	.then(res => {
		// console.log(res);
	});
</script>

<style lang="scss"></style>
