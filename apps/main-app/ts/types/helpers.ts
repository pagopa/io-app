/**
 * Creates a type that can be either T with none of the properties from U, or U with none of the properties from T
 */
export type Either<T, U> = Only<T, U> | Only<U, T>;

/**
 * A type representing an array that contains at least one element.
 */
export type NonEmptyArray<T> = [T, ...Array<T>];

/**
 * A TypeScript type alias called `Prettify`.
 * It takes a type as its argument and returns a new type that has the same properties as the original type,
 * but the properties are not intersected. This means that the new type is easier to read and understand.
 */
export type Prettify<T> = object & {
  [K in keyof T]: T[K];
};

/**
 * Ensures that a type has all properties of T but none of the properties of U
 */
type Only<T, U> = {
  [P in keyof T]: T[P];
} & {
  [P in keyof U]?: never;
};
