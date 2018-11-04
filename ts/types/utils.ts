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
import {
  PayloadCreator,
  PayloadMetaCreator
} from "typesafe-actions/dist/types";
import { Pot } from "./pot";

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

type MapTypeInApiResponse<T, S extends number, B> = T extends IResponseType<
  S,
  infer R
>
  ? IResponseType<S, B>
  : T;

/**
 * Changes the response with status S to have type B
 */
export type MapResponseType<
  T,
  S extends number,
  B
> = T extends IGetApiRequestType<infer P1, infer H1, infer Q1, infer R1>
  ? IGetApiRequestType<P1, H1, Q1, MapTypeInApiResponse<R1, S, B>>
  : T extends IPostApiRequestType<infer P2, infer H2, infer Q2, infer R2>
    ? IPostApiRequestType<P2, H2, Q2, MapTypeInApiResponse<R2, S, B>>
    : T extends IPutApiRequestType<infer P3, infer H3, infer Q3, infer R3>
      ? IPutApiRequestType<P3, H3, Q3, MapTypeInApiResponse<R3, S, B>>
      : T extends IDeleteApiRequestType<infer P4, infer H4, infer Q4, infer R4>
        ? IDeleteApiRequestType<P4, H4, Q4, MapTypeInApiResponse<R4, S, B>>
        : never;

/**
 * Replaces the parameters of the request T with the type P
 */
export type ReplaceRequestParams<T, P> = T extends IGetApiRequestType<
  infer P1,
  infer H1,
  infer Q1,
  infer R1
>
  ? IGetApiRequestType<P, H1, Q1, R1>
  : T extends IPostApiRequestType<infer P2, infer H2, infer Q2, infer R2>
    ? IPostApiRequestType<P, H2, Q2, R2>
    : T extends IPutApiRequestType<infer P3, infer H3, infer Q3, infer R3>
      ? IPutApiRequestType<P, H3, Q3, R3>
      : T extends IDeleteApiRequestType<infer P4, infer H4, infer Q4, infer R4>
        ? IDeleteApiRequestType<P, H4, Q4, R4>
        : never;

/**
 * Adds the status S with response type A to the responses of the request
 */
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

/**
 * Removes a status from the union of IResponseType(s)
 */
export type OmitStatusFromResponse<
  T,
  S extends number
> = T extends IResponseType<S, any> ? never : T;

/**
 * Extracts the type of the payload of a typesafe action
 */
export type PayloadForAction<A> = A extends PayloadCreator<any, infer P>
  ? P
  : A extends PayloadMetaCreator<any, infer P1, any> ? P1 : A;

/**
 * Converts the types of a success and failure actions to a Pot type
 */
export type PotFromActions<S, F> = Pot<
  PayloadForAction<S>,
  PayloadForAction<F>
>;
