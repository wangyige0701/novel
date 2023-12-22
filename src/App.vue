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
@import './style.scss';
@import './uni.scss';

/* #ifndef APP-NVUE */
* {
	margin: 0;
	padding: 0;
}
html {
	font-size: $uni-font-size-base;
}

// 小说阅读页面展示
#novel_content {
	color: $wyg-font-default;
	font-size: $uni-font-size-base;
	&.baixue {
		background-color: $wyg-bg-baixue;
	}
	&.huilv {
		background-color: $wyg-bg-huilv;
	}
	&.qianlan {
		background-color: $wyg-bg-qianlan;
	}
	&.minghuang {
		background-color: $wyg-bg-minghuang;
	}
	&.danlv {
		background-color: $wyg-bg-danlv;
	}
	&.caolv {
		background-color: $wyg-bg-caolv;
	}
	&.hongfen {
		background-color: $wyg-bg-hongfen;
	}
	&.fangmoshui {
		color: $wyg-font-fangmoshui;
		background-color: $wyg-bg-fangmoshui;
	}
	&.mihuang {
		background-color: $wyg-bg-mihuang;
	}
	&.cha {
		background-color: $wyg-bg-cha;
	}
	&.yin {
		background-color: $wyg-bg-yin;
	}
	&.heilv {
		color: $wyg-font-heilv;
		background-color: $wyg-bg-heilv;
	}
	&.qianhuang {
		background-color: $wyg-bg-qianhuang;
	}
	&.wuye {
		color: $wyg-font-wuye;
		background-color: $wyg-bg-wuye;
	}
	&.qianhui {
		background-color: $wyg-bg-qianhui;
	}
	&.qihei {
		color: $wyg-font-qihei;
		background-color: $wyg-bg-qihei;
	}
	&.f_reduce1 {
		font-size: 12px;
	}
	&.f_reduce2 {
		font-size: 10px;
	}
	&.f_increase1 {
		font-size: 16px;
	}
	&.f_increase2 {
		font-size: 18px;
	}
	&.f_increase3 {
		font-size: 20px;
	}
}
/* #endif */
</style>
