export type ToUndefinedObject<T extends Record<string, any>> = Partial<
  Record<keyof T, undefined>
>;

/**
 * This type helper allows you to define a type where either all properties are present
 * or all properties are absent (set to `undefined`). This is useful for enforcing that an
 * object must be either fully populated or completely empty.
 */
export type AllOrNothing<T extends Record<string, any>> =
  | T
  | ToUndefinedObject<T>;

/**
 * A TypeScript type alias called `Prettify`.
 * It takes a type as its argument and returns a new type that has the same properties as the original type,
 * but the properties are not intersected. This means that the new type is easier to read and understand.
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & object;

/**
 * Ensures that a type has all properties of T but none of the properties of U
 */
export type Only<T, U> = {
  [P in keyof T]: T[P];
} & {
  [P in keyof U]?: never;
};

/**
 * Creates a type that can be either T with none of the properties from U, or U with none of the properties from T
 */
export type Either<T, U> = Only<T, U> | Only<U, T>;

/**
 * Creates a type by omitting certain keys from a discriminated union type
 * https://github.com/microsoft/TypeScript/issues/54525
 */
export type DiscriminatedOmit<
  T,
  K extends string | number | symbol
> = T extends any ? Omit<T, K> : never;
