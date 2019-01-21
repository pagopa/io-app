/**
 * A predicate for filtering unique items in an array.
 */
export const uniqueItem = <T>(id: T, index: number, ids: ReadonlyArray<T>) =>
  index === ids.indexOf(id);
