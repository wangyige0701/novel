import { ref } from 'vue';
import { isNumber } from '@wang-yige/utils';

export function getReading(page: number = 1) {
	if (page < 1 || !isNumber(page)) {
		page = 1;
	}
	const current = ref(page);
	const content = ref('');
	const loading = ref(false);

	return {
		page: current,
		content,
		loading,
	};
}
