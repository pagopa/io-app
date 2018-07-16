import { entries } from "lodash";

/**
 * IndexedObject helps creating objects that
 * are indexed by their id (storing both
 * byId and allIds)
 */

type Id = string | number;

// an object with an identifier
// (assuming strings and numbers
// only as identifiers -- change as needed)
interface WithId {
  id: Id;
}

/**
 * represents a "list" of objects that have
 * been indexed by their "id" property
 */
export interface IndexedById<T extends WithId> {
  [key: string]: T;
  [key: number]: T;
}

/**
 * Returns an indexed object generated from a list of objects:
 * - V: object with an index (named id) (e.g. CreditCard)
 * @param lst   input list to be indexed (e.g. [ { id: 1, payload: "X" }, { id: 42, payload: "Y" } ] )
 * @returns     indexed object (e.g. { 1: { id: 1, payload: "X" }, 42: { id: 42, payload: "Y" } } )
 */
export const toIndexed = <T extends WithId>(
  lst: ReadonlyArray<T>
): IndexedById<T> =>
  lst.reduce((o, obj) => ({ ...o, [obj.id]: obj }), {} as IndexedById<T>);

export const addToIndexed = <T extends WithId>(
  indexed: IndexedById<T>,
  newObj: T
): IndexedById<T> =>
  entries(indexed).reduce((o, [k, v]: [Id, T]) => ({ ...o, [k]: v }), {
    [newObj.id]: newObj
  } as IndexedById<T>);
