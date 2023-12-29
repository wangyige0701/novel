<template>
	<view>
		<view v-if="render.show" class="show">show</view>
		<view v-if="render.render" class="render">render</view>
		<view v-if="render.loading" class="laoding">loading</view>
		<view v-if="render.empty" class="empty">emoty</view>
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
	console.log(render.show, render.render, render.loading, render.empty, render.error);
}, 1000);
</script>
