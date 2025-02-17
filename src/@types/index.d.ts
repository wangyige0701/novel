import type { MaybeRef, ComputedRef } from 'vue';

export type UnRef<T> = T extends MaybeRef<infer R> ? R : T extends ComputedRef<infer R> ? R : T;
