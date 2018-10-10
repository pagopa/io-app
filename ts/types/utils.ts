// tslint:disable:readonly-array

import * as t from "io-ts";
import {
  IDeleteApiRequestType,
  IGetApiRequestType,
  IPostApiRequestType,
  IPutApiRequestType,
  IResponseType
} from "italia-ts-commons/lib/requests";
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

export const requiredProp1 = <A, O, I, P extends keyof A>(
  type: t.Type<A, O, I>,
  p: P,
  name?: string
): t.Type<RequiredProp1<A, P>, O, I> =>
  t.refinement(type, o => o[p] !== undefined, name) as any;

export const replaceProp1 = <
  A,
  O,
  I,
  P extends keyof A,
  A1 extends A[P],
  O1,
  I1
>(
  type: t.Type<A, O, I>,
  p: P,
  typeB: t.Type<A1, O1, I1>,
  name?: string
): t.Type<ReplaceProp1<A, P, A1>, O, I> =>
  t.refinement(type, o => typeB.is(o[p]), name) as any;

export type AddResponseType<
  T,
  S extends number,
  A
> = T extends IGetApiRequestType<infer P1, infer H1, infer Q1, infer R1>
  ? IGetApiRequestType<P1, H1, Q1, R1 | IResponseType<S, A>>
  : T extends IPostApiRequestType<infer P2, infer H2, infer Q2, infer R2>
    ? IPostApiRequestType<P2, H2, Q2, R2 | IResponseType<S, A>>
    : T extends IPutApiRequestType<infer P3, infer H3, infer Q3, infer R3>
      ? IPutApiRequestType<P3, H3, Q3, R3 | IResponseType<S, A>>
      : T extends IDeleteApiRequestType<infer P4, infer H4, infer Q4, infer R4>
        ? IDeleteApiRequestType<P4, H4, Q4, R4 | IResponseType<S, A>>
        : never;
