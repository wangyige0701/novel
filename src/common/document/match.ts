/** 忽略中括号和其余换行、换页符 */
const split = `\\[\\]\\s\\f\\n\\r`;

/**
 * 匹配双引号内的属性数据
 */
const attrGet = `"(?<double>[^"${split}]*)"|'(?<single>[^'${split}]*)'|(?<full>[^'"${split}]*)`;

/**
 * 匹配属性的数据
 * @group name 属性名
 * @group double 双引号内的数据
 * @group single 单引号内的数据
 * @group full 全部数据
 * @example `.class[id="test"]` => name: id, double: test
 */
export const allAttr = new RegExp(`\\s*(?<name>[^${split}=]*)(?:\\s*=\\s*(?:${attrGet})\\s*)?`);

/**
 * 切割选择器，正则结果第一位是组合器，第二位是选择器
 * @group combiner 组合器
 * @group selector 选择器
 * @example `div > .class + #id ~ span.a` => combiner: undefined, selector: div; combiner: >, selector: .class; ...
 */
export const splitSelector = /(?<combiner>[>+~\s]?)?(?<selector>[^>+~\s]+)/g;

const ignore = `\\.#${split}`;

export const matchClass = new RegExp(`^\\.(?<cls>[^${ignore}]+)`);

export const matchId = new RegExp(`^#(?<id>[^${ignore}]+)`);

export const matchTag = new RegExp(`^(?<tag>[^${ignore}]+)`);

export const matchAttr = new RegExp(`^\\[(?<attr>[^${split}]+)\\]`);
