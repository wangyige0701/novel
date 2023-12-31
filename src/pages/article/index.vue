<template>
	<StatusBar :full-screen="true">
		<template #statusBar>
			<ArticleContainer :chapter-id="chapterId" :chapter-name="chapterName"></ArticleContainer>
		</template>
	</StatusBar>
</template>

<script setup lang="ts">
import StatusBar from '@comp/statusBar/index.vue';
import ArticleContainer from '@comp/article/container.vue';

const chapterId = ref('');
const chapterName = ref('');

onLoad(options => {
	if (!options) {
		return;
	}
	const { bookId: id, bookName: name } = options;
	chapterId.value = id;
	chapterName.value = name;
});
</script>

<style scoped lang="scss"></style>
