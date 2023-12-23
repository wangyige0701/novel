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
@import './static/scss/config/uni.scss';

/* #ifndef APP-NVUE */
* {
	margin: 0;
	padding: 0;
}
html {
	font-size: $uni-font-size-base;
}
/* #endif */
</style>
