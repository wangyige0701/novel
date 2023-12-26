type ResolveFunc<T extends any = any> = (value: T) => void;

type RejectFunc = (reason?: any) => void;

type ExtractPropertyNames<T extends object> = keyof T;

type GetTypeByBoolean<T1 extends any, T2 extends any, K extends boolean> = K extends true ? T1 : T2;

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never;
