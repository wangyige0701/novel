<script lang="ts">
/** 章节列表模块 */
export default { name: 'ChapterList' };
</script>
<script setup lang="ts">
import type { ChapterList, ChapterListItem } from '@common/regular/@types/homepage';
import { pageRender } from '@common/reactive/pageRender';
import { chapterList } from '@common/regular/index';
import { $_nextTick } from '@common/utils/nextTick';
import { immediate } from '@/config/watch';

interface Props {
	bookId: string;
	bookName: string;
}

interface Emits {
	(id: 'select', value: ChapterListItem): void;
}

/** 占位文本 */
const PlaceholderText = {
	loading: '加载中...',
	placeholder: '暂无数据',
	noId: '书籍id未知',
	system: '系统错误',
};
/** 渲染列表 */
const renderList: ChapterList = shallowReactive<ChapterList>([]);
/** 列表数据操作 */
const listRefresh = {
	clear() {
		renderList.length = 0;
	},

	insert(val: ChapterList) {
		for (const item of val) {
			renderList.push(Object.freeze(item));
		}
	},
};
/** 页面渲染逻辑判断 */
const render = pageRender();
/** 实际占位文字 */
const placeholder = ref('');

onBeforeUnmount(() => {
	watchStop?.();
	watchEffectStop?.();
});

const props = withDefaults(defineProps<Props>(), {
	bookId: '',
	bookName: '',
});

const emits = defineEmits<Emits>();

/**
 * 请求章节列表
 * @param id
 */
function requestChapterList(id: string) {
	render.init();
	listRefresh.clear();
	if (!id) {
		render.toEmpty();
		return;
	}
	render.toLoad();
	chapterList(
		id,
		value => {
			if (value === true) {
				if (renderList.length === 0) {
					render.toEmpty();
				}
				return;
			}
			listRefresh.insert(value ?? []);
		},
		true,
	)
		.then(data => {
			if (!data) {
				render.toEmpty();
				return;
			}
			$_nextTick(render.toRender);
		})
		.catch(err => {
			render.toError();
			throw new Error(err);
		});
}

function clickChapter(item: ChapterListItem) {
	emits('select', {
		name: item.name,
		href: item.href,
	});
}

const watchStop = watch(
	() => props.bookId,
	newId => {
		requestChapterList(newId);
	},
	immediate,
);

const watchEffectStop = watchEffect(() => {
	placeholder.value = render.loading
		? PlaceholderText.loading
		: render.empty
			? props.bookId
				? PlaceholderText.placeholder
				: PlaceholderText.noId
			: render.error
				? PlaceholderText.system
				: '';
});
</script>

<template>
	<view
		v-if="!render.show"
		class="chapter-list-render-tip"
		:class="render.loading ? 'loading' : render.empty ? 'placeholder' : render.error ? 'error' : ''"
		>{{ placeholder }}</view
	>
	<view v-else class="full-size chapter-list-container">
		<view
			class="text-ellipsis list-item"
			v-for="(item, index) in renderList"
			:key="'chapter-list-' + index"
			@click="item.href ? clickChapter(item) : null"
		>
			<text class="text" :class="item.href ? '' : 'no-href'">{{ item.name }}</text>
		</view>
	</view>
</template>

<style scoped lang="scss">
@import '../../style/scss/config/main.scss';

.chapter-list-container {
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;

	.list-item {
		width: 100%;
		height: $wyg-list-height-base;
		line-height: $wyg-list-height-base;
		font-size: $wyg-font-size-sm;
		color: $wyg-text-color-normal;
		box-sizing: border-box;
		padding-left: $wyg-spacing-row-base;
		border-radius: $wyg-border-radius-sm;
		transition: background-color 0.3s;

		&:has(.text:not(.no-href)):active {
			background-color: $wyg-bg-color-hover;
		}

		.text.no-href {
			color: $wyg-text-color-placeholder;
		}

		&:last-child {
			margin-bottom: $wyg-spacing-col-base;
		}
	}
}
</style>
