// tslint:disable:readonly-array

import { Effect } from "redux-saga";

export type SagaCallReturnType<
  T extends (...args: any[]) => any,
  R = ReturnType<T>
> = R extends Iterator<infer B | Effect>
  ? B
  : R extends IterableIterator<infer B1 | Effect>
    ? B1
    : R extends Promise<infer B2> ? B2 : never;

/**
 * From T omit a set of properties K
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
