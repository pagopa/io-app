/**
 * IndexedObject helps creating objects that
 * are indexed by their id (storing both
 * byId and allIds)
 */

import { none, Option, some } from "fp-ts/lib/Option";

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
interface IndexedById<V extends WithId> {
  [key: string]: V;
  [key: number]: V;
}

/**
 * An indexed object generated from a list of objects:
 * Instantiated by IndexedObject.create()
 *  - input: [ { id: 1, payload: "X" }, { id: 42, payload: "Y" } ]
 *  - output:
 *    {
 *      byId: { 1: { id: 1, payload: "X" }, 42: { id: 42, payload: "Y" } },
 *      allIds: [1, 42]
 *    }
 *  - V: object with an index (named id) (e.g. CreditCard)
 */
export class IndexedObject<V extends WithId> {
  public static create<T extends WithId>(
    lst: ReadonlyArray<T>
  ): IndexedObject<T> {
    const byId: IndexedById<T> = lst.reduce(
      (o, obj) => ({ ...o, [obj.id]: obj }),
      {} as IndexedById<T>
    );
    const allIds: ReadonlyArray<Id> = lst.map(v => v.id);
    return new IndexedObject(byId, allIds);
  }

  private constructor(
    private readonly byId: IndexedById<V>,
    private readonly allIds: ReadonlyArray<Id>
  ) {}

  public get(key: Id): Option<V> {
    const obj = this.byId[key];
    if (obj === undefined) {
      return none;
    }
    return some(obj);
  }

  public values(): ReadonlyArray<V> {
    return this.allIds.map(k => this.byId[k]);
  }

  public keys(): ReadonlyArray<Id> {
    return this.allIds;
  }
}
