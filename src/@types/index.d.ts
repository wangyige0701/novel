import type { Constructor } from '@wang-yige/utils';
import type { MaybeRef, ComputedRef, Component } from 'vue';

export type UnRef<T> = T extends MaybeRef<infer R> ? R : T extends ComputedRef<infer R> ? R : T;

type PickProps<T> = T extends Component<infer P> ? P : never;

export type GetProps<T> = T extends Component ? PickProps<T>['$props'] : never;

export type IDType = string | number;

export type Clz<T extends abstract new (...args: any[]) => any> = Constructor<
	InstanceType<T>,
	ConstructorParameters<T>
>;
