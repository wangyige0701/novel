<template>
	<template v-for="(item, index) of render" :key="'interact-' + index">
		<Mask
			v-bind="{ ...item.options }"
			:z-index="InteractConfig.baseZIndex + index"
			:close-mask="() => closeByMask(item, index)"
			:visible="unref(item.visible)"
			:duration="InteractConfig.duration"
			:mask="item.mask"
			:mask-closable="item.maskClosable"
		>
			<template v-if="item.component">
				<!-- 组件内部需要提供默认属性 -->
				<component
					ref="itemRefs"
					:is="item.component"
					v-bind="{ ...item.options }"
					:visible="unref(item.visible)"
					:transition-duration="InteractConfig.duration"
					:resolve="item.resolve"
					:reject="item.reject"
					:close="() => close(item, index)"
				/>
			</template>
		</Mask>
	</template>
</template>

<script setup lang="ts">
import { unref } from 'vue';
import { ElementOf } from '@wang-yige/utils';
import type { InteractUses } from '@/@types/components/interact';
import type { UnRef } from '@/@types';
import { useInteractStore } from '@/store/interact';
import Mask from '@/components/Interact/Mask/Mask.vue';
import Tip from '@/components/Interact/Tip/Tip.vue';
import Modal from '@/components/Interact/Modal/Modal.vue';
import Popup from '@/components/Interact/Popup/Popup.vue';
import Loading from '@/components/Interact/Loading/Loading.vue';
import InteractConfig from '@/config/interact';

const maskClosableItems: InteractUses[] = ['modal', 'popup'];
const maskVisibleItems: InteractUses[] = ['loading', 'modal', 'popup'];
const map = {
	tip: Tip,
	modal: Modal,
	popup: Popup,
	loading: Loading,
};
const useInteract = useInteractStore();
const itemRefs = ref<any[]>([]);
const render = computed(() => {
	return useInteract.value.map(item => {
		const { use, options, visible, reject, resolve } = item;
		return {
			options,
			visible,
			resolve,
			reject,
			component: getComponent(use),
			maskClosable: maskClosableItems.includes(use),
			mask: maskVisibleItems.includes(use),
		};
	});
});

function getComponent(use: InteractUses) {
	if (use in map) {
		return map[use];
	} else {
		throw new Error('Interact component not found');
	}
}

function closeByMask(item: ElementOf<UnRef<typeof render>>, inedx: number) {
	close(item, inedx);
	const ref = itemRefs.value[inedx];
	if (ref && ref.closeByMask) {
		// 不同组件关闭遮罩层时触发不同回调，组件内部决定
		ref.closeByMask();
	}
}

function close(item: ElementOf<UnRef<typeof render>>, inedx: number) {
	item.visible.value = false;
	setTimeout(() => {
		useInteract.close(inedx);
	}, InteractConfig.duration);
}
</script>
