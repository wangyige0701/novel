### 交互组件

```ts
const { popup, tip, modal, loading } = useInteractStore();
popup({
	title: '提示',
	button: false,
});

tip.warning({
	message: '功能开发中',
	position: 'stick-top',
});

modal({
	title: '提示',
	message: '功能开发中',
})
	.then(res => {
		console.log(res);
	})
	.catch(err => {
		console.log(err);
	});

loading({
	duration: 2000,
});
```
