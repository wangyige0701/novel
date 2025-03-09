/** 忽略中括号和其余换行、换页符 */
const excludeBracket = `\\[\\]\\s\\f\\n\\r`;

/** 获取属性值 */
const attributeValue = `"[^"${excludeBracket}]*"|'[^'${excludeBracket}]*'|[^${excludeBracket}]*`;

/**
 * 匹配中括号内的属性数据
 * @example [id="test"] [checked] [data-type="test"]
 */
const matchAttribute = `\\[(?:\\s*[^${excludeBracket}]*(?:\\s*=\\s*(?:${attributeValue})\\s*))?\\]`;
console.log(matchAttribute);

/** 匹配组合器连接符 */
const connect = `\\s*[>+~]?\\s*`;

/** 匹配选择器去除id、class前缀的剩余字符 */
const matchSelectorString = `(?:[^>+~#\\.${excludeBracket}])+`;

/** 匹配id、class选择器 */
const matchSelectorWithoutTag = `[#\\.]${matchSelectorString}(?:${matchAttribute})*`;

/** 匹配标签选择器 */
const matchSelectorJustTag = `${matchSelectorString}(?:${matchAttribute})*`;

/** 获取引号内的数据 */
export const getDataInQuote = /"(.*)"|'(.*)'|(.*)/;

/** 匹配属性的数据 */
export const getAttributeDatas = new RegExp(`\\[\\s*([^${excludeBracket}]*)\\s*=\\s*(${attributeValue})\\s*\\]`, 'g');

/** 切割选择器，id、class选择器和标签选择器相连时，标签选择器会作为下一个元素被切割 */
export const split = new RegExp(
	`(${connect})?((?:(?:${matchSelectorWithoutTag})|(?<!(?:${matchAttribute}))(?:${matchSelectorJustTag}))+)`,
	'g',
);

/** 匹配选择器内所有有效数据 */
export const nameMatch = new RegExp(
	`(?:(?:#(?<idVal>[^#\\.${excludeBracket}]+))|(?:\\.(?<classVal>[^#\\.${excludeBracket}]+))|(?<tagVal>[^#\\.${excludeBracket}]+))(?<attrs>(?:${matchAttribute})*)?`,
	'g',
);
