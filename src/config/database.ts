/**
 * 字段类型
 */
export enum Type {
	TEXT = 'TEXT',
	INTEGER = 'INTEGER',
	REAL = 'REAL',
	BLOB = 'BLOB',
	NUMERIC = 'NUMERIC',
	DATETIME = 'DATETIME',
	TIMESTAMP = 'TIMESTAMP',
	BOOLEAN = 'BOOLEAN',
}

export default {
	main: {
		name: 'main',
		path: '_doc/main.db',
	},
};
