type ResolveFunc<T extends any = any> = (value: T) => void;

type RejectFunc = (reason?: any) => void;

type VoidFunc = () => void;

type ExtractPropertyNames<T extends object> = keyof T;

type GetTypeByBoolean<T1 extends any, T2 extends any, K extends boolean> = K extends true ? T1 : T2;

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never;

type PickRequireType<T extends object, K extends any> = {
	[P in keyof T as T[P] extends K ? P : never]: T[P];
};

type PickRequireTypes<T extends object, K extends Array<any>> = K extends [infer X, ...infer R]
	? PickRequireType<T, X> & PickRequireTypes<T, R>
	: {};

type PickChangeType<T extends object, K extends any> = {
	[P in keyof T]: K;
};
