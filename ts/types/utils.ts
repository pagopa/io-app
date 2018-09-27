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

export type ReplaceProp1<T, P1 extends keyof T, A> = { [K in P1]: A } &
  Pick<T, Exclude<keyof T, P1>>;

export type ReplaceProp2<T, P1 extends keyof T, P2 extends keyof T[P1], A> = {
  [K in P1]: ReplaceProp1<T[K], P2, A>
} &
  Pick<T, Exclude<keyof T, P1>>;

/**
 * Removes null/undefined types from T[P1]
 */
export type RequiredProp1<T, P1 extends keyof T> = ReplaceProp1<
  T,
  P1,
  NonNullable<T[P1]>
>;

/**
 * Removes null/undefined types from T[P1][P2]
 */
export type RequiredProp2<
  T,
  P1 extends keyof T,
  P2 extends keyof T[P1]
> = ReplaceProp2<T, P1, P2, NonNullable<T[P1][P2]>>;
