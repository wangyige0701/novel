<template>
	<template v-for="(item, index) of render" :key="'interact-' + index">
		<Mask
			v-bind="{ ...item.options }"
			:z-index="InteractConfig.baseZIndex + index"
			:close-mask="() => closeByMask(item, index)"
			:visible="unref(item.visible)"
			:duration="InteractConfig.duration"
		>
			<template v-if="item.component">
				<!-- 组件内部需要提供默认属性 -->
				<component
					ref="itemRefs"
					:is="item.component"
					v-bind="{ ...item.options }"
					:visible="unref(item.visible)"
					:duration="InteractConfig.duration"
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
import InteractConfig from '@/config/interact';

const useInteract = useInteractStore();
const itemRefs = ref<any[]>([]);
const render = computed(() => {
	return useInteract.value.map(item => {
		const { use, options, reject, resolve } = item;
		return {
			component: getComponent(use),
			options,
			visible: ref(true),
			resolve,
			reject,
		};
	});
});

function getComponent(use: InteractUses) {
	if (use === 'tip') {
		return Tip;
	} else if (use === 'modal') {
		return Modal;
	} else if (use === 'popup') {
		return Popup;
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
