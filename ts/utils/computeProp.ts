/**
 * Create an object with the passed key and value, enforcing type safety.
 * This method should be _always_ used when dealing with dynamic object's keys.
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
 * Thanks to:
 * https://stackoverflow.com/questions/65182369/how-to-make-typescript-type-check-object-literals-with-dynamic-keys
 *
 */
export function computedProp<K extends PropertyKey, V>(
  key: K,
  value: V
): K extends any ? { [P in K]: V } : never {
  return { [key]: value } as any;
}
