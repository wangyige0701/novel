<template>
	<image :key="src" :src="src" :mode="props.mode" :lazyload="props.lazyload" @error="onError" @load="onLoad"></image>
</template>

<script setup lang="ts">
import type { ImageComponentProps, ImageComponentEmits } from '@/@types/components/image';
import { isString } from '@wang-yige/utils';

const props = defineProps<ImageComponentProps>();
const emit = defineEmits<ImageComponentEmits>();

const src = ref<string>(props.src || '');

function onError(e: any) {
	emit('error', e);
	if (props.reload) {
		const str = props.reload(src.value);
		if (isString(str)) {
			src.value = str;
		}
	}
}

function onLoad(e: any) {
	emit('load', e);
}
</script>
