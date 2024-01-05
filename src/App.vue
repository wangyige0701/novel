<script setup lang="ts">
import { onLaunch, onShow, onHide, onError } from '@dcloudio/uni-app';
onLaunch(() => {
	console.log('App Launch');
});
onShow(() => {
	console.log('App Show');
});
onHide(() => {
	console.log('App Hide');
});
onError(err => {
	console.log(err);
});
</script>

<style lang="scss">
@import './style/scss/config/main.scss';

/* #ifndef APP-NVUE */
* {
	margin: 0;
	padding: 0;
}

html {
	font-size: $wyg-font-size-base;
}

text {
	font-size: inherit;
	color: inherit;
}

.full-screen {
	width: 100vw;
	height: 100vh;
}

.full-size {
	width: 100%;
	height: 100%;
}

.text-ellipsis {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.no-scrollbar {
	&::-webkit-scrollbar {
		display: none;
	}
}
/* #endif */
</style>
