import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";

export const findFirstCaseInsensitive =
  <T>(obj: { [key: string]: T }) =>
  (key: string): O.Option<[string, T]> =>
    pipe(
      obj,
      Object.entries,
      A.findFirst(([k, _]) => k.toLowerCase() === key.toLowerCase())
    );

/**
 * This function aims to handle cases where it is uncertain whether a key exists in an object and provides a fallback value.
 * @param obj The object from which to extract the value
 * @param key The desired key
 * @param fallback The fallback key
 * @example
 * // Example 1
 * const obj = {
 *  it_IT: "it",
 *  en_EN: "en"
 * };
 * const key: "it_IT"|"en_EN"|"de_DE" = "de_DE";
 * const result = getOrFallback(obj, key, "it_IT");
 *
 * console.log(result); // the result will fallback to "it"
 *
 * // Example 2
 * const obj = {
 *  it_IT: "it",
 *  en_EN: "en",
 *   de_DE: "de"
 * };
 * const key: "it_IT"|"en_EN"|"de_DE" = "de_DE";
 * const result = getOrFallback(obj, key, "it_IT");
 *
 * console.log(result); // the result will be "de"
 */
export function getOrFallback<
  O extends object,
  K1 extends keyof O,
  K2 extends keyof O
>(obj: O, key: K1, fallback: K2) {
  return obj[key] ?? obj[fallback];
}
