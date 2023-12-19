<template>
	<view class="content">
		<text>{{ req }}</text>
		<text>abcdefg</text>
	</view>
</template>

<script setup lang="ts">
import { search } from '@/api/search';
import { parseHTML } from '@/regular/parseHtml';

const req = ref('');

search('斗破苍穹')
	.then(res => {
		console.log(res);
		const data = String(res);
		const parse = parseHTML(data)[0];
		console.log(parse.type === 'tag' || parse.type === 'script' ? parse.children : parse.text);
	})
	.catch(err => {
		console.error(err);
	});
</script>

<style lang="scss"></style>
