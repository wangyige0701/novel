import { getArticleData, getHomepageData, getListData } from './dingdian';

const SEARCH_FUN = {
	dingdian: getListData,
};

export function main() {
	getListData('斗破苍穹', 'desc')
		.then(data => {
			console.log(data);
			return getHomepageData(data[0].value[3].href);
		})
		.then(data => {
			console.log(data);
			return getArticleData(data.chaptersList[0].href!);
		})
		.then(data => {
			console.log(data);
		});
}
