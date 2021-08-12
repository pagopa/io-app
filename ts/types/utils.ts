/* eslint-disable */

import { Pot } from "italia-ts-commons/lib/pot";
import { Effect } from "redux-saga/effects";
import { PayloadAC, PayloadMetaAC } from "typesafe-actions/dist/type-helpers";

export type SagaCallReturnType<
  T extends (...args: any[]) => any,
  R = ReturnType<T>
> = R extends Generator<infer _, infer B0, infer _>
  ? B0
  : R extends Iterator<infer B | Effect>
  ? B
  : R extends IterableIterator<infer B1 | Effect>
  ? B1
  : R extends Promise<infer B2>
  ? B2
  : never;

/**
 * Extracts the type of the payload of a typesafe action
 */
export type PayloadForAction<A> = A extends PayloadAC<any, infer P>
  ? P
  : A extends PayloadMetaAC<any, infer P1, any>
  ? P1
  : A;

/**
 * Converts the types of a success and failure actions to a Pot type
 */
export type PotFromActions<S, F> = Pot<
  PayloadForAction<S>,
  PayloadForAction<F>
>;

/**
 * Ensure that all the keys of type T are required, transforming all optional field of kind T | undefined to T
 */
export type RequiredAll<T> = { [K in keyof T]-?: T[K] };

/**
 * Return a type that prohibits the use of keys that are present only in T but not in U
 */
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

/**
 * Ensure that the types T and U are mutually exclusive
 */
export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

type Values<T extends {}> = T[keyof T];

type Tuplize<T extends any[]> = Pick<
  T,
  Exclude<keyof T, Extract<keyof any[], string> | number>
>;

type _OneOf<T extends {}> = Values<
  {
    [K in keyof T]: T[K] &
      { [M in Values<{ [L in keyof Omit<T, K>]: keyof T[L] }>]?: undefined };
  }
>;

/**
 * Ensure that the types T extends any[] are mutually exclusive
 */
export type OneOf<T extends any[]> = _OneOf<Tuplize<T>>;
