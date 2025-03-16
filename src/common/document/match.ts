/** 忽略中括号和其余换行、换页符 */
const split = `\\[\\]\\s\\f\\n\\r`;

/** 允许空格符 */
const splitAllowSpace = '\\[\\]\\f\\n\\r';

/**
 * 匹配双引号内的属性数据；引号内部可以有空格
 */
const attrGet = `"(?<double>[^"${splitAllowSpace}]*)"|'(?<single>[^'${splitAllowSpace}]*)'|(?<full>[^'"${split}]*)`;

/**
 * 解析属性的数据
 * @group name 属性名
 * @group double 双引号内的数据
 * @group single 单引号内的数据
 * @group full 全部数据
 * @example `id="test"` => name: id, double: test
 */
export const parseAttr = new RegExp(`\\s*(?<name>[^${split}=]*)(?:\\s*=\\s*(?:${attrGet})\\s*)?`);

/**
 * 切割选择器，正则结果第一位是组合器，第二位是选择器；选择器中有属性时，允许属性值匹配空格
 * @group combiner 组合器
 * @group selector 选择器
 * @example `div > .class + #id ~ span.a` => combiner: undefined, selector: div; combiner: >, selector: .class; ...
 * @example `div[style="font-size: 12px"]` => combiner: undefined, selector: div[style="font-size: 12px"]
 */
export const splitSelector = /(?<combiner>[>+~]?)?\s*(?<selector>[^>+~\s\f\r\n\[\]]+(?:\[[^\]\f\r\n]+\])?)/g;

const ignore = `\\.#${split}`;

export const matchClass = new RegExp(`^\\.(?<cls>[^${ignore}]+)`);

export const matchId = new RegExp(`^#(?<id>[^${ignore}]+)`);

export const matchTag = new RegExp(`^(?<tag>[^${ignore}]+)`);

export const matchAttr = new RegExp(`^\\[(?<attr>[^${splitAllowSpace}]+)\\]`);
