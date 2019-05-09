/**
 * A type guard that filters out undefined and null from a type T
 */
export function isDefined<T, O extends NonNullable<T>>(v: T): v is O {
  return v !== null && v !== undefined;
}