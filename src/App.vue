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
@import './static/scss/config/main.scss';
@import './static/scss/config/color.scss';

/* #ifndef APP-NVUE */
* {
	margin: 0;
	padding: 0;
}
html {
	font-size: $wyg-font-size-base;
}
.full-screen {
	width: 100vw;
	height: 100vh;
}

text {
	font-size: $wyg-font-size-base;
	color: $wyg-text-color-normal;
}
/* #endif */
</style>
