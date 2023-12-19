type ResolveFunc = (value: any) => void;

type RejectFunc = (reason?: any) => void;

type ExtractPropertyNames<T extends object> = keyof T;

type GetTypeByBoolean<T1 extends any, T2 extends any, K extends boolean> = K extends true ? T1 : T2;
