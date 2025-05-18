import { createPromise } from '@wang-yige/utils';

const { promise, resolve } = createPromise();

export const initPromise = promise;
export const initResolve = resolve;
