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
