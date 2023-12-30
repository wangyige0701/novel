<template>
	<StatusBar :full-screen="true">
		<template #statusBar>
			<ArticleContainer :book-id="bookId" :book-name="bookName"></ArticleContainer>
		</template>
	</StatusBar>
</template>

<script setup lang="ts">
import StatusBar from '@comp/statusBar/index.vue';
import ArticleContainer from '@comp/article/container.vue';

const bookId = ref('');
const bookName = ref('');

onLoad(options => {
	if (!options) {
		return;
	}
	const { bookId: id, bookName: name } = options;
	bookId.value = id;
	bookName.value = name;
});
</script>

<style scoped lang="scss"></style>
