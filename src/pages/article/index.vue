<template>
	<view>Test</view>
</template>

<script setup lang="ts">
import { search } from '@/regular';

const test = ref(0);

function req() {
	search('a')
		.then(data => {
			console.log(data);
		})
		.catch(err => {
			console.error(err);
		})
		.finally(() => {
			if (test.value < 20)
				setTimeout(() => {
					test.value++;
				}, 500);
		});
}

watchEffect(() => {
	req();
	test.value;
});
</script>
