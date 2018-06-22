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
export interface IndexedById<V extends WithId> {
  [key: string]: V;
  [key: number]: V;
}

/**
 * Returns an indexed object generated from a list of objects:
 * - V: object with an index (named id) (e.g. CreditCard)
 * @param lst   input list to be indexed (e.g. [ { id: 1, payload: "X" }, { id: 42, payload: "Y" } ] )
 * @returns     indexed object (e.g. { 1: { id: 1, payload: "X" }, 42: { id: 42, payload: "Y" } } )
 */
export function toIndexed<T extends WithId>(
  lst: ReadonlyArray<T>
): IndexedById<T> {
  return lst.reduce((o, obj) => ({ ...o, [obj.id]: obj }), {} as IndexedById<
    T
  >);
}
