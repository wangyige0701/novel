<template>
	<view>
		<view v-if="render.show" class="show">show</view>
		<view v-if="render.render" class="render">render</view>
		<view v-if="render.loading" class="laoding">loading</view>
		<view v-if="render.empty" class="empty">empty</view>
		<view v-if="render.error" class="error">error</view>
	</view>
</template>

<script setup lang="ts">
import { pageRender } from '@/custom/ref/pageRender';

const render = pageRender();

render.init();
render.toLoad();
setTimeout(() => {
	render.toRender();
	setTimeout(() => {
		render.toEmpty();
		setTimeout(() => {
			render.toError();
			setTimeout(() => {
				render.toRender();
			}, 1000);
		}, 1000);
	}, 1000);
}, 1000);
</script>
