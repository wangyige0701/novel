<template>
	<view class="width-full flex flex-row flex-center search_container">
		<view class="flex flex-center back" :class="props.back ? 'visible' : 'hidden'">
			<text v-if="props.back" class="icon-back" @click.stop="toBack"></text>
		</view>
		<view class="flex flex-row flex-nowrap flex-center flex-1 border transition search_box">
			<text class="inline-block text-center icon-search transition search_icon"></text>
			<input
				class="flex-1 height-full search_input"
				:placeholder="props.placeholder"
				v-model="modelValue"
				type="text"
				:maxlength="50"
				confirm-type="search"
				@confirm="search"
			/>
		</view>
		<text class="whitespace-nowrap search_text" @click.stop="search">{{ props.text }}</text>
	</view>
</template>

<script setup lang="ts">
import type { SearchComponentEmits, SearchComponentProps } from '@/@types/components/search';
import { Path } from '@/common/path';
import { Pages } from '@/config/pages';

const props = withDefaults(defineProps<SearchComponentProps>(), {
	modelValue: '',
	placeholder: '请输入搜索内容',
	text: '搜索',
	back: true,
});
const emit = defineEmits<SearchComponentEmits>();

const value = ref<string>(props.modelValue);
const modelValue = computed({
	get() {
		return value.value;
	},
	set(val) {
		value.value = val;
		emit('update:modelValue', val);
	},
});

function search() {
	emit('search', modelValue.value);
	if (!modelValue.value) {
		return;
	}
	if (!props.back) {
		Path.navigateTo(Pages.Search, {
			params: {
				search: modelValue.value,
			},
		});
	}
}

function toBack() {
	if (!props.back) {
		return;
	}
	Path.navigateBack();
}
</script>

<style scoped lang="scss">
@use 'sass:math';
@use '@/style/index.scss' as Scss;

$gap: math.div(Scss.$gap-base, 2);

.back {
	width: 0;
	&.hidden {
		padding-left: Scss.$gap-base;
	}
	&.visible {
		width: Scss.$font-xl * 2.5;
	}
	.icon-back {
		font-size: Scss.$font-xl * 1.2;
		font-weight: bold;
	}
}

.search_container {
	height: Scss.$search-bar-height;
	background-color: transparent;
	color: Scss.$text-normal-color;
	font-size: Scss.$font-xl * 1.1;
}

.search_box {
	height: math.div(Scss.$search-bar-height, 1.6);
	border-radius: math.div(Scss.$search-bar-height, 2);
	color: inherit;
	font-size: inherit;
	transition-property: border-color;
	&:focus-within {
		border-color: Scss.$primary-color;
		.search_icon {
			color: Scss.$primary-color;
		}
	}
}

.search_icon {
	width: Scss.$icon-size * 1.5;
	padding-left: $gap;
	transition-property: color;
	font-size: 35rpx;
	box-sizing: content-box;
}

.search_input {
	padding: 0 Scss.$gap-base 0 $gap;
	font-size: 35rpx;
}

.search_text {
	padding: 0 Scss.$gap-base;
	color: Scss.$text-color;
	&:active {
		color: Scss.$text-secondary-color;
	}
}
</style>
