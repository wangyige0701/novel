const callbacks: Function[] = [];
let pending = false;

function flushCallbacks() {
	pending = false;
	const executes = callbacks.slice(0);
	callbacks.length = 0;
	for (let i = 0; i < executes.length; i++) {
		executes[i]?.();
	}
}

let $_n: () => any;

if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
	$_n = () => {
		process.nextTick(flushCallbacks);
	};
} else if (typeof Promise !== 'undefined' && typeof Promise === 'function') {
	const p = Promise.resolve();
	$_n = () => {
		p.then(flushCallbacks);
	};
} else if (typeof MutationObserver === 'function') {
	let counter = 1;
	const ob = new MutationObserver(flushCallbacks);
	const textNode = document.createTextNode(String(counter));
	ob.observe(textNode, {
		characterData: true,
	});
	$_n = () => {
		counter = (counter + 1) % 2;
		textNode.data = String(counter);
	};
} else if (typeof setImmediate !== 'undefined' && typeof setImmediate === 'function') {
	$_n = () => {
		setImmediate(flushCallbacks);
	};
} else {
	$_n = () => {
		setTimeout(flushCallbacks, 0);
	};
}

/**
 * 模拟将任务推入微队列
 * @param callback
 */
export function $_nextTick(callback: Function) {
	callbacks.push(() => {
		if (callback && typeof callback === 'function') {
			callback();
		}
	});
	if (!pending) {
		pending = true;
		$_n();
	}
}
