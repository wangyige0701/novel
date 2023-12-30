<template>
	<StatusBar :full="true">
		<ArticleContainer :book-id="''" :book-name="''"></ArticleContainer>
	</StatusBar>
</template>

<script setup lang="ts">
import StatusBar from '@comp/statusBar/index.vue';
import ArticleContainer from '@comp/article/container.vue';
import { articleContent as testData } from '@test/data/article.test';
</script>

<style scoped lang="scss"></style>
