/**
 * Enhance the type with the testID that should be used to locate a view in end-to-end tests.
 */
export type TestID = { testID?: string };

export type WithTestID<T> = T & TestID;
