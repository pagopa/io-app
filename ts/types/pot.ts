// tslint:disable:parameters-max-number

import * as option from "fp-ts/lib/Option";

/**
 * Empty value, not yet retrieved.
 */
type None = Readonly<{
  kind: "PotNone";
}>;

export const none: None = {
  kind: "PotNone"
};

/**
 * Empty value, loading.
 */
type NoneLoading = Readonly<{
  kind: "PotNoneLoading";
}>;

export const noneLoading: NoneLoading = {
  kind: "PotNoneLoading"
};

/**
 * Empty value, updating a new value to remote store.
 */
type NoneUpdating<T> = Readonly<{
  kind: "PotNoneUpdating";
  newValue: T;
}>;

export const noneUpdating = <T>(newValue: T): NoneUpdating<T> => ({
  kind: "PotNoneUpdating",
  newValue
});

/**
 * Empty value, loading failed.
 */
type NoneError<E> = Readonly<{
  kind: "PotNoneError";
  error: E;
}>;

export const noneError = <E>(error: E): NoneError<E> => ({
  kind: "PotNoneError",
  error
});

/**
 * Loaded value.
 */
type Some<T> = Readonly<{
  kind: "PotSome";
  value: T;
}>;

export const some = <T>(value: T): Some<T> => ({
  kind: "PotSome",
  value
});

/**
 * Loaded value, loading a new value from remote.
 */
type SomeLoading<T> = Readonly<{
  kind: "PotSomeLoading";
  value: T;
}>;

export const someLoading = <T>(value: T): SomeLoading<T> => ({
  kind: "PotSomeLoading",
  value
});

/**
 * Loaded value, updating a new value to remote store.
 */
type SomeUpdating<T> = Readonly<{
  kind: "PotSomeUpdating";
  value: T;
  newValue: T;
}>;

export const someUpdating = <T>(value: T, newValue: T): SomeUpdating<T> => ({
  kind: "PotSomeUpdating",
  value,
  newValue
});

/**
 * Loaded value, loading an updated value failed.
 */
type SomeError<T, E> = Readonly<{
  kind: "PotSomeError";
  value: T;
  error: E;
}>;

export const someError = <T, E>(value: T, error: E): SomeError<T, E> => ({
  kind: "PotSomeError",
  value,
  error
});

export type Pot<T, E> =
  | None
  | NoneLoading
  | NoneUpdating<T>
  | NoneError<E>
  | Some<T>
  | SomeLoading<T>
  | SomeUpdating<T>
  | SomeError<T, E>;

export type PotType<T> = T extends Some<infer A0>
  ? A0
  : T extends SomeLoading<infer A1>
    ? A1
    : T extends SomeError<infer A2, any> ? A2 : never;

export type PotErrorType<T> = T extends NoneError<infer E0>
  ? E0
  : T extends SomeError<any, infer E1> ? E1 : never;

export const toSomeLoading = <T>(
  p: Some<T> | SomeError<T, any>
): SomeLoading<T> => someLoading(p.value);

export const isSome = <A, E = unknown>(
  p: Pot<A, E>
): p is Some<A> | SomeLoading<A> | SomeUpdating<A> | SomeError<A, E> => // tslint:disable-line:max-union-size
  p.kind === "PotSome" ||
  p.kind === "PotSomeLoading" ||
  p.kind === "PotSomeUpdating" ||
  p.kind === "PotSomeError";

export const isNone = <A, E = unknown>(
  p: Pot<A, E>
): p is None | NoneLoading | NoneUpdating<A> | NoneError<E> => // tslint:disable-line:max-union-size
  p.kind === "PotNone" ||
  p.kind === "PotNoneLoading" ||
  p.kind === "PotNoneUpdating" ||
  p.kind === "PotNoneError";

export const isLoading = <A>(
  p: Pot<A, any>
): p is NoneLoading | SomeLoading<A> =>
  p.kind === "PotNoneLoading" || p.kind === "PotSomeLoading";

export const isUpdating = <A>(
  p: Pot<A, any>
): p is NoneUpdating<A> | SomeUpdating<A> =>
  p.kind === "PotNoneUpdating" || p.kind === "PotSomeUpdating";

export const isError = <A, E = unknown>(
  p: Pot<A, E>
): p is NoneError<E> | SomeError<A, E> =>
  p.kind === "PotNoneError" || p.kind === "PotSomeError";

export const toLoading = <T>(p: Pot<T, any>): SomeLoading<T> | NoneLoading =>
  isSome(p) ? someLoading(p.value) : noneLoading;

export const toUpdating = <T>(
  p: Pot<T, any>,
  newValue: T
): SomeUpdating<T> | NoneUpdating<T> =>
  isSome(p) ? someUpdating(p.value, newValue) : noneUpdating(newValue);

export const toError = <T, E = unknown>(
  p: Pot<T, E>,
  error: E
): NoneError<E> | SomeError<T, E> =>
  isSome(p) ? someError(p.value, error) : noneError(error);

export const fold = <A, E, O>(
  p: Pot<A, E>,
  foldNone: () => O,
  foldNoneLoading: () => O,
  foldNoneUpdating: (newValue: A) => O,
  foldNoneError: (error: E) => O,
  foldSome: (value: A) => O,
  foldSomeLoading: (value: A) => O,
  foldSomeUpdating: (value: A, newValue: A) => O,
  foldSomeError: (value: A, error: E) => O
): O => {
  switch (p.kind) {
    case "PotNone":
      return foldNone();
    case "PotNoneLoading":
      return foldNoneLoading();
    case "PotNoneUpdating":
      return foldNoneUpdating(p.newValue);
    case "PotNoneError":
      return foldNoneError(p.error);
    case "PotSome":
      return foldSome(p.value);
    case "PotSomeLoading":
      return foldSomeLoading(p.value);
    case "PotSomeUpdating":
      return foldSomeUpdating(p.value, p.newValue);
    case "PotSomeError":
      return foldSomeError(p.value, p.error);
  }
};

export const map = <A, B, E = unknown>(
  p: Pot<A, E>,
  f: (_: A) => B
): Pot<B, E> =>
  fold<A, E, Pot<B, E>>(
    p,
    () => none,
    () => noneLoading,
    newValue => noneUpdating(f(newValue)),
    error => noneError(error),
    value => some(f(value)),
    value => someLoading(f(value)),
    (value, newValue) => someUpdating(f(value), f(newValue)),
    (value, error) => someError(f(value), error)
  );

export const filter = <A, E = unknown>(
  p: Pot<A, E>,
  f: (v: A) => boolean
): Pot<A, E> =>
  fold(
    p,
    () => p,
    () => p,
    () => p,
    () => p,
    value => (f(value) ? p : none),
    value => (f(value) ? p : noneLoading),
    (value, newValue) => (f(value) ? p : noneUpdating(newValue)),
    (value, error) => (f(value) ? p : noneError(error))
  );

export const mapNullable = <A, B, E = unknown>(
  p: Pot<A, E>,
  f: (_: A) => B | undefined | null
): Pot<B, E> => {
  const mapped = map(p, f);
  return filter(mapped, _ => _ !== undefined && _ !== null) as Pot<B, E>;
};

export const getOrElse = <A>(p: Pot<A, any>, o: A): A =>
  isSome(p) ? p.value : o;

export const getOrElseWithUpdating = <A>(p: Pot<A, any>, o: A): A =>
  isUpdating(p) ? p.newValue : isSome(p) ? p.value : o;

export const orElse = <A, E = unknown>(p: Pot<A, E>, o: Pot<A, E>): Pot<A, E> =>
  isSome(p) ? p : o;

export const toUndefined = <A>(p: Pot<A, any>): A | undefined =>
  isSome(p) ? p.value : undefined;

export const toOption = <A>(p: Pot<A, any>): option.Option<A> =>
  option.fromNullable(toUndefined(p));
