<template>
	<view class="content">
		<text>{{ req }}</text>
		<text>abcdefg</text>
	</view>
</template>

<script setup lang="ts">
import { getListData } from '@/regular/dingdian/list';

const req = ref('');

getListData('斗破苍穹').then(res => {
	console.log(res);
});
</script>

<style lang="scss"></style>
