// Mirrors the runtime shape of fp-ts' Option, which is how versions of this
// app built with fp-ts serialized `keyTag` to disk. Kept as a plain type
// (instead of importing fp-ts) so old persisted data can still be read.
export type SerializedOption<T> = { _tag: "None" } | { _tag: "Some"; value: T };

export const none: SerializedOption<never> = { _tag: "None" };

export const some = <T>(value: T): SerializedOption<T> => ({
  _tag: "Some",
  value
});

export const isSome = <T>(
  option: SerializedOption<T>
  // eslint-disable-next-line no-underscore-dangle
): option is { _tag: "Some"; value: T } => option._tag === "Some";

export const toUndefined = <T>(option: SerializedOption<T>): T | undefined =>
  isSome(option) ? option.value : undefined;

export const fromNullable = <T>(
  value: null | T | undefined
): SerializedOption<T> => (value != null ? some(value) : none);
