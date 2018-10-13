import { entries } from "lodash";

/**
 * represents a "list" of objects that have
 * been indexed by a specific property
 */
export interface IndexedById<T> {
  [key: string]: T | undefined;
  [key: number]: T | undefined;
}

/**
 * Returns an indexed object generated from a list of objects:
 * - V: object with a user-specified index (e.g. Wallet -> idWallet)
 * @param lst   input list to be indexed (e.g. [ { id: 1, payload: "X" }, { id: 42, payload: "Y" } ] )
 * @param key   function to extract the key from T
 * @returns     indexed object (e.g. { 1: { id: 1, payload: "X" }, 42: { id: 42, payload: "Y" } } )
 */
export const toIndexed = <T>(
  lst: ReadonlyArray<T>,
  key: (_: T) => string | number
): IndexedById<T> =>
  lst.reduce((o, obj) => ({ ...o, [key(obj)]: obj }), {} as IndexedById<T>);

/**
 * Adds a new object to an indexed "list" of objects
 * The added object should be indexable by the same
 * key as the previously added items
 * @param indexed existing indexed object
 * @param newObj  object to be added
 * @param key     key used to extract the index from `newObj`
 * @returns       new indexed object, with the elements from indexed and newObj
 */
export const addToIndexed = <T>(
  indexed: IndexedById<T>,
  newObj: T,
  key: (_: T) => string | number
): IndexedById<T> =>
  entries(indexed).reduce(
    (o, [k, v]: [string, T | undefined]) => ({ ...o, [k]: v }),
    {
      [key(newObj)]: newObj
    } as IndexedById<T>
  );
