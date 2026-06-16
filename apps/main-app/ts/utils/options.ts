/**
 * Utils for Option items
 */
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

// Check if 2 option set contains the same items
export function areSetEqual<T>(a: O.Option<Set<T>>, b: O.Option<Set<T>>) {
  const setA = pipe(
    a,
    O.getOrElse(() => new Set())
  );
  const setB = pipe(
    b,
    O.getOrElse(() => new Set())
  );

  const diff = setA.size > setB.size ? new Set(setA) : new Set(setB);
  const items = setA.size > setB.size ? new Set(setB) : new Set(setA);

  items.forEach(item => diff.delete(item));
  return diff.size === 0;
}

// Check if 2 option strings has the same value
export function areStringsEqual(
  aa: O.Option<string>,
  bb: O.Option<string>,
  caseInsensitive: boolean = false
): boolean {
  return pipe(
    aa,
    O.fold(
      () => false,
      (a: string) =>
        pipe(
          bb,
          O.fold(
            () => false,
            (b: string) =>
              caseInsensitive ? a.toLowerCase() === b.toLowerCase() : a === b
          )
        )
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
): O.Option<R> =>
  pipe(
    item,
    O.fromNullable,
    O.chainNullableK(s => s[key]),
    O.map(value => extractor(value))
  );
