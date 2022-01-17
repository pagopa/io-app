/**
 * Create an object with the passed key and value, enforcing type safety.
 * This method should _always_ be used when dealing with union type / enum
 * dynamic object's keys.
 *
 * ```typescript
 * type CustomObject = {
 *   a: number;
 *   b: number;
 * };
 *
 * const initCustomObject: CustomObject = { a: 0, b: 0 };
 *
 * function editedCustomObject(k: keyof CustomObject) {
 *   // This is valid for the compiler.
 *   const nonTypeSafe: CustomObject = { ...initCustomObject, [k]: 'foo' };
 *
 *   // This is _NOT_ valid for the compiler.
 *   const typeSafe: CustomObject = { ...initCustomObject, ...computedProp(k, 'foo') };
 * }
 * ```
 *
 * Thanks to: https://stackoverflow.com/a/65182957
 *
 */
export function computedProp<K extends PropertyKey, V>(
  key: K,
  value: V
): K extends any ? { [P in K]: V } : never {
  return { [key]: value } as any;
}
