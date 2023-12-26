<template>
	<view>主页</view>
</template>

<script setup lang="ts">
onLoad(options => {
	if (!options) {
		return;
	}
	const { bookId } = options;
	console.log(bookId);
});
</script>

<style scoped lang="scss"></style>
