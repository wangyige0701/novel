<template>
	<StatusBar color="transparent" :full="true">
		<template #statusBar="{ height }">
			<view class="content">
				<view class="placeholder" v-if="hasData === false"></view>
				<view class="container" v-else>
					<view class="info"></view>
					<view class="list">
						<!--  -->
					</view>
				</view>
			</view>
		</template>
	</StatusBar>
</template>

<script setup lang="ts">
import StatusBar from '@/components/statusBar/index.vue';
import { bookHome } from '@/regular/index';
import { homePageData as testData } from '@test/data/homepage.test';

const hasData = ref(false);

onLoad(options => {
	if (!options) {
		return;
	}
	const { bookId } = options;
	getBookHomeData(bookId);
});

function getBookHomeData(id: string) {
	settingDatas(testData);
	// bookHome(id)
	// 	.then(data => {
	// 		console.log(data);
	// 	})
	// 	.catch(err => {
	// 		throw new Error(err);
	// 	});
}

function settingDatas(datas: any) {
	if (datas) {
		hasData.value = true;
	} else {
		hasData.value = false;
	}
	console.log(datas);
}
</script>

<style scoped lang="scss">
.content {
	width: 100%;
	height: 100%;
}

.container {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	overflow-y: scroll;
	scroll-snap-type: y proximity;

	> * {
		flex-shrink: 0;
		scroll-snap-align: start;
		scroll-snap-stop: always;
	}

	.info {
		width: 100%;
		height: 400px;
		background-color: green;
	}

	.list {
		width: 100%;
		height: 2000px;
		background: linear-gradient(to bottom, #b142e4, #f71212);
	}
}
</style>
