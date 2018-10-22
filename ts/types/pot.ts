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
 * Loaded value, loading an updated value.
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
  | NoneError<E>
  | Some<T>
  | SomeLoading<T>
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
): p is Some<A> | SomeLoading<A> | SomeError<A, E> =>
  p.kind === "PotSome" ||
  p.kind === "PotSomeLoading" ||
  p.kind === "PotSomeError";

export const isNone = <A, E = unknown>(
  p: Pot<A, E>
): p is None | NoneLoading | NoneError<E> =>
  p.kind === "PotNone" ||
  p.kind === "PotNoneLoading" ||
  p.kind === "PotNoneError";

export const isLoading = <A>(
  p: Pot<A, any>
): p is NoneLoading | SomeLoading<A> =>
  p.kind === "PotNoneLoading" || p.kind === "PotSomeLoading";

export const isError = <A, E = unknown>(
  p: Pot<A, E>
): p is NoneError<E> | SomeError<A, E> =>
  p.kind === "PotNoneError" || p.kind === "PotSomeError";

export const toLoading = <T>(p: Pot<T, any>): SomeLoading<T> | NoneLoading =>
  isSome(p) ? someLoading(p.value) : noneLoading;

export const toError = <T, E = unknown>(
  p: Pot<T, E>,
  error: E
): NoneError<E> | SomeError<T, E> =>
  isSome(p) ? someError(p.value, error) : noneError(error);

export const map = <A, B, E = unknown>(
  p: Pot<A, E>,
  f: (_: A) => B
): Pot<B, E> =>
  isSome(p)
    ? {
        ...p,
        value: f(p.value)
      }
    : p;

export const getOrElse = <A>(p: Pot<A, any>, o: A): A =>
  isSome(p) ? p.value : o;

export const orElse = <A, E = unknown>(p: Pot<A, E>, o: Pot<A, E>): Pot<A, E> =>
  isSome(p) ? p : o;

export const toUndefined = <A>(p: Pot<A, any>): A | undefined =>
  isSome(p) ? p.value : undefined;

export const toOption = <A>(p: Pot<A, any>): option.Option<A> =>
  option.fromNullable(toUndefined(p));
