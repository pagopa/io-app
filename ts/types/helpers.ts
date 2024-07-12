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
