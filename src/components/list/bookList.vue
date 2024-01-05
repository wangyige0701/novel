<template>
	<view v-if="!props.bookList || props.bookList.length === 0" :class="props.placeholder" class="full-size"></view>
	<view v-else class="book-list-container">
		<view class="book" v-for="(item, index) in props.bookList" :key="'book-list-' + index">
			<BookListItem :item="item" @click="interactive.onClick(item)"></BookListItem>
		</view>
	</view>
</template>

<script setup lang="ts">
import BookListItem from './bookListItem.vue';

interface Props {
	/** 图书列表 */
	bookList: Array<BookListType>;
	/** 没有图书数据时的类名，默认是placeholder */
	placeholder?: string;
}

interface Emits {
	(e: 'select', value: BookListClickType): void;
}

const props = withDefaults(defineProps<Props>(), {
	bookList: () => [],
	placeholder: 'placeholder',
});

const emit = defineEmits<Emits>();

/** 交互操作函数 */
const interactive = {
	/**
	 * 点击书籍
	 * @param item
	 */
	onClick(item: BookListType) {
		emit('select', {
			name: item.name,
			href: item.href,
		});
	},

	onScroll(e: any) {
		console.log(e);
	},
};

function globalClick() {
	console.log(...arguments);
}

defineExpose({
	globalClick,
});
</script>

<style scoped lang="scss">
@import '../../style/scss/config/main.scss';

.placeholder {
	background-color: grey;
}

.book-list-container {
	display: grid;
	grid-template-columns: 1fr;
	grid-auto-rows: 250rpx;
	gap: $wyg-gap-base;
	justify-items: center;
	padding: $wyg-gap-base;
}

.book {
	width: 100%;
	height: 250rpx;

	@media screen and (min-width: 1024px) {
		width: 60%;
	}
}
</style>
