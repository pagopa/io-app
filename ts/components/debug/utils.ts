type Primitive = string | number | boolean | null | undefined;

type TruncatableValue =
  | Primitive
  | TruncatableObject
  | TruncatableArray
  | TruncatableSet;

interface TruncatableObject {
  [key: string]: TruncatableValue;
}

type TruncatableArray = Array<TruncatableValue>;
type TruncatableSet = Set<TruncatableValue>;

/**
 * Truncates all string values in an object or array structure to a specified maximum length.
 * This function creates a deep copy of the input, ensuring the original is not modified.
 *
 * @template T - The type of the input value, must extend TruncatableValue
 * @param {T} value - The value to process. Can be a string, number, boolean, null, undefined, array, or object
 * @param {number} [maxLength=250] - The maximum length for string values. Defaults to 250
 * @returns {T} A new value of the same type as the input, with all strings truncated to the specified length
 *
 * @example
 * const obj = { name: "Very long name...", age: 30, details: { bio: "Long bio..." } };
 * const truncated = truncateObjectStrings(obj, 10);
 * // Result: { name: "Very long...", age: 30, details: { bio: "Long bio..." } }
 */
export const truncateObjectStrings = <T extends TruncatableValue>(
  value: T,
  maxLength: number = 250
): T => {
  if (typeof value === "string") {
    return (
      value.length > maxLength ? value.slice(0, maxLength) + "..." : value
    ) as T;
  }

  if (Array.isArray(value)) {
    return value.map(item => truncateObjectStrings(item, maxLength)) as T;
  }

  if (typeof value === "object" && value !== null) {
    if (value instanceof Set) {
      // Set could not be serialized to JSON because values are not stored as properties
      // For display purposes, we convert it to an array
      return Array.from(value).map(item =>
        truncateObjectStrings(item, maxLength)
      ) as T;
    }

    return Object.entries(value).reduce(
      (acc, [key, val]) => ({
        ...acc,
        [key]: truncateObjectStrings(val, maxLength)
      }),
      {}
    ) as T;
  }

  return value;
};
