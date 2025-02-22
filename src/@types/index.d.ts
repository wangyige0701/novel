import type { MaybeRef, ComputedRef, Component } from 'vue';

export type UnRef<T> = T extends MaybeRef<infer R> ? R : T extends ComputedRef<infer R> ? R : T;

type PickProps<T> = T extends Component<infer P> ? P : never;

export type GetProps<T> = T extends Component ? PickProps<T>['$props'] : never;
