// Biometrics type used in io-app code base
// https://github.com/pagopa/io-app/blob/master/ts/utils/biometrics.ts#L31
export type BiometricsValidType = "BIOMETRICS" | "FACE_ID" | "TOUCH_ID";

export type InputType = "credit-card" | "default" | "iban";

/** Returns a type with the desired type or null */
export type Nullable<T> = null | T;

/** Returns a type with the desired type or undefined */
export type Optional<T> = T | undefined;

/**
 * Ensure that all the keys of type T are required, transforming all optional
 * field of kind T | undefined to T
 */
export type RequiredAll<T> = { [K in keyof T]-?: T[K] };

/**
 * Enhance the type with the testID that should be used to locate a view in
 * end-to-end tests.
 */
export type TestID = { testID?: string };

export type TextInputValidationRefProps = {
  blur: () => void;
  focus: () => void;
  validateInput: () => void;
};

// A generic recursive type for the theme
export type Theme = {
  [key: string]: Theme | ThemeSimpleValue;
};

export type ThemeSimpleValue = number | string | undefined;

export type WithTestID<T> = T & TestID;

/** Ensure that the types T and U are mutually exclusive */
export type XOR<T, U> = T | U extends object
  ? (T & Without<U, T>) | (U & Without<T, U>)
  : T | U;

/**
 * Return a type that prohibits the use of keys that are present only in T but
 * not in U
 */
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
