import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { IndexedById } from "../helpers/indexer";

/**
 * Utility functions to work with an IndexedById<pot.Pot<T, E>>
 */

/**
 * Try to read a pot from a {@link IndexedById}. Return pot.none if not found
 * @param id
 * @param data
 */
export const readPot = <T, E>(
  id: string | number,
  data: IndexedById<pot.Pot<T, E>>
): pot.Pot<T, E> =>
  pipe(
    data[id],
    O.fromNullable,
    O.getOrElseW(() => pot.none)
  );

/**
 * Return a new IndexedById<pot.Pot<T, E>>, updating the entry with key id to pot.loading
 * @param id
 * @param data
 */
export const toLoading = <T, E>(
  id: string | number,
  data: IndexedById<pot.Pot<T, E>>
): IndexedById<pot.Pot<T, E>> => ({
  ...data,
  [id]: pot.toLoading(readPot(id, data))
});

/**
 * Return a new IndexedById<pot.Pot<T, E>>, updating the entry with id with the new pot.some value
 * @param id
 * @param data
 * @param value
 */
export const toSome = <T, E>(
  id: string | number,
  data: IndexedById<pot.Pot<T, E>>,
  value: T
): IndexedById<pot.Pot<T, E>> => ({
  ...data,
  [id]: pot.some(value)
});

/**
 * Return a new IndexedById<pot.Pot<T, E>>, changing the entry with id to error
 * @param id
 * @param data
 * @param value
 */
export const toError = <T, E>(
  id: string | number,
  data: IndexedById<pot.Pot<T, E>>,
  value: E
): IndexedById<pot.Pot<T, E>> => ({
  ...data,
  [id]: pot.toError(readPot(id, data), value)
});

/**
 * Return a new IndexedById<pot.Pot<T, E>>, updating the entry with id to updating
 * @param id
 * @param data
 * @param value
 */
export const toUpdating = <T, E>(
  id: string | number,
  data: IndexedById<pot.Pot<T, E>>,
  value: T
): IndexedById<pot.Pot<T, E>> => ({
  ...data,
  [id]: pot.toUpdating(readPot(id, data), value)
});

/**
 * Return a new IndexedById<pot.Pot<T, E>>, updating the entry with id to none
 * @param id
 * @param data
 */
export const toNone = <T, E>(
  id: string | number,
  data: IndexedById<pot.Pot<T, E>>
): IndexedById<pot.Pot<T, E>> => ({
  ...data,
  [id]: pot.none
});
