/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @jambit/typed-redux-saga/use-typed-effects */
import { Pot } from "@pagopa/ts-commons/lib/pot";
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

type _OneOf<T extends {}> = Values<{
  [K in keyof T]: T[K] & {
    [M in Values<{ [L in keyof Omit<T, K>]: keyof T[L] }>]?: undefined;
  };
}>;

/**
 * Ensure that the types T extends any[] are mutually exclusive
 */
export type OneOf<T extends any[]> = _OneOf<Tuplize<T>>;

/**
 * Create an object with the passed key and value, enforcing type safety.
 * This method should _always_ be used when dealing with union type / enum
 * dynamic object's keys.
 *
 * ```typescript
 * type CustomObject = {
 *   a: number;
 *   b: number;
 * };
 *
 * const initCustomObject: CustomObject = { a: 0, b: 0 };
 *
 * function editedCustomObject(k: keyof CustomObject) {
 *   // This is valid for the compiler.
 *   const nonTypeSafe: CustomObject = { ...initCustomObject, [k]: 'foo' };
 *
 *   // This is _NOT_ valid for the compiler.
 *   const typeSafe: CustomObject = { ...initCustomObject, ...computedProp(k, 'foo') };
 * }
 * ```
 *
 * Thanks to: https://stackoverflow.com/a/65182957
 *
 */
export function computedProp<K extends PropertyKey, V>(
  key: K,
  value: V
): K extends any ? { [P in K]: V } : never {
  return { [key]: value } as any;
}

/**
 * This is a wrapper type for `Effect` used in the
 * code for backward compatibility. In the codebase
 * it should not be possible to import directly
 * from `redux-saga/effects` due to the strict typing
 * provided by `typed-redux-saga`.
 */
export type ReduxSagaEffect = Effect;
