// tslint:disable:readonly-array

import { Pot } from "io-ts-commons/lib/pot";
import { Effect } from "redux-saga";
import {
  PayloadCreator,
  PayloadMetaCreator
} from "typesafe-actions/dist/types";

export type SagaCallReturnType<
  T extends (...args: any[]) => any,
  R = ReturnType<T>
> = R extends Iterator<infer B | Effect>
  ? B
  : R extends IterableIterator<infer B1 | Effect>
    ? B1
    : R extends Promise<infer B2> ? B2 : never;

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
