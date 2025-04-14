import 'reflect-metadata';
import sqlstring from 'sqlstring';
import {
	type ElementOf,
	type Fn,
	isArray,
	isBoolean,
	isDate,
	isDef,
	isNumber,
	isObject,
	isString,
	isUndef,
	toArray,
	toNumber,
	toString,
} from '@wang-yige/utils';
import type {
	ColumnMetadata,
	ColumnOptions,
	IndexOptions,
	SqliteColumnOption,
	SqliteIndexOption,
} from '@/@types/common/database';
import { Type } from '@/config/database';
import SQLite from './SQLite';
import { SelectConditionArrays } from './base';

/**
 * 根据列的元数据生成对应的字段创建 SQL 语句
 * @param options 列元数据配置项
 * @param isUpdate 是否用于更新语法，更新字段时，空字段必须有默认值
 */
export function columnSql(options: ColumnOptions, isUpdate: boolean = false) {
	const { type, name, unique = false, nullable = true, key = false, default: _default } = options;
	const merges = [];
	if (type) {
		merges.push(Type[type]);
	}
	if (!nullable) {
		merges.push('NOT NULL');
	}
	if (isDef(_default)) {
		merges.push(`DEFAULT ${_default}`);
	} else if (isUpdate) {
		throw new Error(`更新的列 ${name} 允许为空但是没有提供默认值`);
	}
	if (unique) {
		merges.push('UNIQUE');
	}
	if (key) {
		merges.push('PRIMARY KEY');
	}
	return sqlstring.escapeId(name) + ' ' + merges.join(' ');
}

/**
 * 生成索引语句
 */
function compareIndexs(tableName: string, current: IndexOptions[], origin: SqliteIndexOption[] = []) {
	const add = [] as IndexOptions[];
	const remove = [] as string[];
	for (const item of current) {
		const target = origin.find(i => i.name === item.name);
		if (!target) {
			add.push(item);
		} else {
			const unique = isBoolean(item.unique) ? +item.unique : 0;
			// 判断唯一索引以及条件索引是否保持一直，不会检查具体条件
			if (unique !== target.unique || +!!item.where !== target.partial) {
				remove.push(item.name);
				add.push(item);
			}
		}
	}
	for (const item of origin) {
		// unique 和 primary key 自动创建的索引不进行更新
		if (item.origin === 'u' || item.origin === 'pk') {
			continue;
		}
		const target = current.find(i => i.name === item.name);
		if (!target) {
			remove.push(item.name);
		}
	}
	return {
		add: add.map(i => {
			const columns = toArray(i.columns)
				.map(v => sqlstring.escapeId(v))
				.join(',');
			if (i.unique) {
				return `CREATE UNIQUE INDEX ${sqlstring.escapeId(i.name)} ON ${tableName} (${columns});`;
			}
			if (i.where) {
				return `CREATE INDEX ${sqlstring.escapeId(i.name)} ON ${tableName} (${columns}) WHERE ${i.where};`;
			}
			return `CREATE INDEX ${sqlstring.escapeId(i.name)} ON ${tableName} (${columns});`;
		}),
		remove: remove.map(name => {
			return `DROP INDEX IF EXISTS ${sqlstring.escapeId(name)};`;
		}),
	};
}

/**
 * 比较传入字段和数据库字段
 * @return false 需要更新， true 不需要更新
 */
function compareColumn(current: ColumnOptions, origin: SqliteColumnOption) {
	const { type: currentType, default: _default, nullable = true, key = false } = current;
	const { type: originType, dflt_value, notnull, pk } = origin;
	if (currentType !== originType) {
		return false;
	}
	if (+key !== +pk) {
		return false;
	}
	if (+nullable !== +!notnull) {
		return false;
	}
	if ((isDef(_default) || isDef(dflt_value)) && toString(_default) !== toString(dflt_value)) {
		return false;
	}
	return true;
}

/**
 * 数据表更新处理
 * @param sqlite 数据库实例
 * @param tableName 未进行转义的数据表名
 * @param columns 所有列的元数据
 * @param indexs 所有索引的元数据
 * @param createSql 创建表的 sql 语句获取方法
 */
export async function updateTableSql(
	sqlite: SQLite,
	tableName: string,
	columns: ColumnMetadata,
	indexs: IndexOptions[],
	createSql: Fn<[string], string[]>,
) {
	const escapeTableName = sqlstring.escapeId(tableName);
	await sqlite.open();
	const infoList = (await sqlite.select(`PRAGMA table_info(${escapeTableName});`)) as Array<SqliteColumnOption>;
	const indexList = (await sqlite.select(`PRAGMA index_list(${escapeTableName});`)) as Array<SqliteIndexOption>;
	if (!infoList || !infoList.length) {
		await sqlite.close();
		return;
	}
	const tableColumns = columns.map(item => item.options);
	const adds = [] as ColumnOptions[];
	const modifies = [] as string[];
	const removes = [] as string[];
	// 收集新增字段
	for (const column of tableColumns) {
		const target = infoList.find(item => item.name === column.name);
		if (!target) {
			adds.push(column);
			continue;
		}
		if (!compareColumn(column, target) && !modifies.find(item => item === column.name)) {
			modifies.push(target.name);
		}
	}
	// 收集删除字段
	for (const item of infoList) {
		const target = tableColumns.find(column => column.name === item.name);
		if (!target) {
			removes.push(item.name);
		}
	}
	const _execute = async (sqls: string[]) => {
		await sqlite.execute(sqls);
		await sqlite.close();
		return sqls;
	};
	if (modifies.length || removes.length) {
		// 创建临时表并迁移数据
		const tempName = sqlstring.escapeId(tableName + '_new_temp');
		const copyColumns = columns
			.map(item => {
				if (!removes.includes(item.options.name!)) {
					return sqlstring.escapeId(item.options.name);
				}
			})
			.filter(Boolean)
			.join(',');
		return await _execute([
			`DROP TABLE IF EXISTS ${tempName};`,
			...createSql(tempName),
			`INSERT INTO ${tempName} (${copyColumns}) SELECT ${copyColumns} FROM ${escapeTableName};`,
			`DROP TABLE ${escapeTableName};`,
			`ALTER TABLE ${tempName} RENAME TO ${escapeTableName};`,
			...compareIndexs(escapeTableName, indexs).add,
		]);
	}
	/** 索引更新执行的 sql */
	const indexSqls = compareIndexs(escapeTableName, indexs, indexList);
	if (adds.length) {
		// 新增字段
		return await _execute([
			...adds.map(item => {
				return `ALTER TABLE ${escapeTableName} ADD COLUMN ${columnSql(item)};`;
			}),
			...indexSqls.remove,
			...indexSqls.add,
		]);
	}
	const updateIndexs = [...indexSqls.remove, ...indexSqls.add];
	if (updateIndexs.length) {
		return await _execute(updateIndexs);
	}
	await sqlite.close();
	return;
}

export function stringifyValue(key: string, value: any, type: Type, hasDefault: boolean = false) {
	if (type === Type.DATETIME || type === Type.TIMESTAMP) {
		if (isDef(value) && !isDate(value)) {
			throw new Error(`字段 ${key} 必须是日期类型`);
		}
		const timestamp = type === Type.TIMESTAMP;
		if (!hasDefault) {
			if (timestamp) {
				return (value || new Date()).getTime();
			}
			return (value || new Date()).toISOString();
		}
		if (value) {
			if (timestamp) {
				return value.getTime();
			}
			return value.toISOString();
		}
		return null;
	}
	if (type === Type.BLOB) {
		if (isDef(value) && !ArrayBuffer.isView(value)) {
			throw new Error(`字段 ${key} 必须是 ArrayBuffer 类型`);
		}
		return value ? new Uint8Array(value.buffer) : null;
	}
	if (type === Type.BOOLEAN) {
		if (isDef(value) && !isBoolean(value)) {
			throw new Error(`字段 ${key} 必须是布尔类型`);
		}
		if (isUndef(value)) {
			return null;
		}
		return value ? 1 : 0;
	}
	if (type === Type.INTEGER || type === Type.NUMERIC) {
		if (isDef(value) && !isNumber(value)) {
			throw new Error(`字段 ${key} 必须是数字类型`);
		}
		if (isUndef(value)) {
			return null;
		}
		return toNumber(value);
	}
	return value;
}

export function parseValue(value: any, type: Type) {
	if (type === Type.DATETIME) {
		if (isDef(value)) {
			return new Date(value);
		}
		return value;
	}
	if (type === Type.BLOB) {
		if (isDef(value)) {
			return new Blob([value]);
		}
		return value;
	}
	if (type === Type.BOOLEAN) {
		if (value === 1) {
			return true;
		}
		if (value === 0) {
			return false;
		}
		return value;
	}
	if (type === Type.INTEGER || type === Type.NUMERIC) {
		if (value) {
			return toNumber(value);
		}
		return value;
	}
	return value;
}

export function parseConditions(condition: ElementOf<SelectConditionArrays<any>>) {
	let { type, value } = condition;
	if (type === 'where') {
		if (isString(value)) {
			value = [value];
		}
		if (!isArray(value) || !value.every(isString)) {
			throw new Error('where 条件必须为字符串或字符串数组');
		}
		return `WHERE ${value.map(i => sqlstring.escapeId(i)).join(' AND ')}`;
	}
	if (type === 'order') {
		if (!isObject(value) || !Object.values(value).every(i => i !== 'DESC' || i !== 'ASC')) {
			throw new Error('order 条件必须为对象，且值为 DESC 或 ASC');
		}
		const orders = [];
		for (const [key, order] of Object.entries(value)) {
			orders.push(`${sqlstring.escapeId(key)} ${order}`);
		}
		return `ORDER BY ${orders.join(',')}`;
	}
	if (type === 'group') {
		if (isString(value)) {
			value = [value];
		}
		if (!isArray(value) || !value.every(isString)) {
			throw new Error('group 条件必须为字符串或字符串数组');
		}
		return `GROUP BY ${value.map(i => sqlstring.escapeId(i)).join(',')}`;
	}
	if (type === 'limit') {
		if (!isNumber(value)) {
			throw new Error('limit 条件必须为数字');
		}
		return `LIMIT ${value}`;
	}
	if (type === 'offset') {
		if (!isNumber(value)) {
			throw new Error('offset 条件必须为数字');
		}
		return `OFFSET ${value}`;
	}
	return '';
}
