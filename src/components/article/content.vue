<template>
	<view class="article-content-container">
		<view class="title">{{ title }}</view>
		<view class="content">
			<p v-for="(item, index) in contentList" :key="'article-content' + index">{{ item }}</p>
		</view>
		<slot name="operate" :prev="hrefs[0]" :next="hrefs[1]"></slot>
	</view>
</template>

<script setup lang="ts">
import type { ArticleReturnVal } from '@/regular/@types/article';

interface Props {
	/** 文章数据对象 */
	data: ArticleReturnVal;
}

const props = withDefaults(defineProps<Props>(), {
	data: () => {
		return {
			title: '',
			content: [],
			next_href: '',
			prev_href: '',
		};
	},
});

const title = ref<string>(props.data.title);
const hrefs = ref<[string, string]>([props.data.prev_href, props.data.next_href]);
const contentList = shallowReactive<string[]>([]);

/** 设置文本内容 */
function settingContent(list: ArticleReturnVal['content']) {
	contentList.length = 0;
	list.forEach(item => {
		contentList.push(item.toString());
	});
}

watchEffect(() => {
	title.value = props.data.title;
	hrefs.value = [props.data.prev_href, props.data.next_href];
	settingContent(props.data.content);
});

defineExpose({
	hrefs,
});
</script>

<style scoped lang="scss">
@import '../../static/scss/config/main.scss';

.article-content-container {
	--height-size: 3;
	width: 100%;
	display: flex;
	flex-direction: column;
	color: inherit;

	.title {
		min-height: calc(var(--height-size) * $wyg-font-size-title);
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: $wyg-font-size-title;
		font-weight: bold;
		margin-top: $wyg-spacing-col-lg;
		color: inherit;
		box-sizing: border-box;
		padding: 0 $wyg-spacing-row-base;
	}

	.content {
		flex-shrink: 0;
		margin-top: calc(2 * $wyg-spacing-col-base);
		padding-bottom: $wyg-spacing-col-lg;
		color: inherit;

		p {
			font-size: $wyg-font-size-paragraph;
			line-height: calc(var(--height-size) / 1.6 * $wyg-font-size-paragraph);
			text-indent: 2em;
			color: inherit;
			margin-bottom: calc(2 * $wyg-spacing-col-base);
		}
	}
}
</style>
