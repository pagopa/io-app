/**
 * Utils for Option items
 */
import { fromNullable, Option } from "fp-ts/lib/Option";

// Check if 2 option set contains the same items
export function areSetEqual<T>(a: Option<Set<T>>, b: Option<Set<T>>) {
  const setA = a.getOrElse(new Set());
  const setB = b.getOrElse(new Set());

  const diff = setA.size > setB.size ? new Set(setA) : new Set(setB);
  const items = setA.size > setB.size ? new Set(setB) : new Set(setA);

  items.forEach(item => diff.delete(item));
  return diff.size === 0;
}

// Check if 2 option strings has the same value
export function areStringsEqual(
  aa: Option<string>,
  bb: Option<string>,
  caseInsensitive: boolean = false
): boolean {
  return aa.fold(false, (a: string) =>
    bb.fold(false, (b: string) =>
      caseInsensitive ? a.toLowerCase() === b.toLowerCase() : a === b
    )
  );
}

/**
 * return some of item[key] if item is defined and item[key] too
 * @param item
 * @param key
 * @param extractor
 */
export const maybeInnerProperty = <T, K extends keyof T, R>(
  item: T | undefined,
  key: K,
  extractor: (value: T[K]) => R
): Option<R> =>
  fromNullable(item)
    .mapNullable(s => s[key])
    .map(value => extractor(value));
