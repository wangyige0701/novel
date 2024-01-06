<script lang="ts">
/** 章节文本内容显示模块 */
export default { name: 'ChapterContent' };
</script>
<script setup lang="ts">
import type { ArticleReturnVal } from '@common/regular/@types/article';

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

<template>
	<view class="article-content-container">
		<slot name="pageStart" :prev="hrefs[0]" :next="hrefs[1]"></slot>
		<view class="title">{{ title }}</view>
		<view class="content">
			<p v-for="(item, index) in contentList" :key="'article-content' + index">{{ item }}</p>
		</view>
		<slot name="pageEnd" :prev="hrefs[0]" :next="hrefs[1]"></slot>
	</view>
</template>

<style scoped lang="scss">
@import '../../style/scss/config/main.scss';

.article-content-container {
	--height-size: 3;
	width: 100%;
	display: flex;
	flex-direction: column;
	color: inherit;

	.title {
		min-height: calc(var(--height-size) * var(--title));
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: var(--title);
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
		padding-left: $wyg-spacing-row-base;
		padding-right: $wyg-spacing-row-base;
		color: inherit;

		p {
			font-size: var(--paragraph);
			line-height: calc(var(--height-size) / 1.6 * var(--paragraph));
			text-indent: 2em;
			color: inherit;
			margin-bottom: calc(2 * $wyg-spacing-col-base);
		}
	}
}
</style>
