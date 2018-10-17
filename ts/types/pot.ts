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
type NoneError = Readonly<{
  kind: "PotNoneError";
  error: Error;
}>;

export const noneError = (error: Error): NoneError => ({
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
type SomeError<T> = Readonly<{
  kind: "PotSomeError";
  value: T;
  error: Error;
}>;

export const someError = <T>(value: T, error: Error): SomeError<T> => ({
  kind: "PotSomeError",
  value,
  error
});

export type Pot<T> =
  | None
  | NoneLoading
  | NoneError
  | Some<T>
  | SomeLoading<T>
  | SomeError<T>;

export type PotType<T> = T extends Some<infer A0>
  ? A0
  : T extends SomeLoading<infer A1>
    ? A1
    : T extends SomeError<infer A2> ? A2 : never;

export const toSomeLoading = <T>(p: Some<T> | SomeError<T>): SomeLoading<T> =>
  someLoading(p.value);

export const isSome = <A>(
  p: Pot<A>
): p is Some<A> | SomeLoading<A> | SomeError<A> =>
  p.kind === "PotSome" ||
  p.kind === "PotSomeLoading" ||
  p.kind === "PotSomeError";

export const isNone = <A>(p: Pot<A>): p is None | NoneLoading | NoneError =>
  p.kind === "PotNone" ||
  p.kind === "PotNoneLoading" ||
  p.kind === "PotNoneError";

export const isLoading = <A>(p: Pot<A>): p is NoneLoading | SomeLoading<A> =>
  p.kind === "PotNoneLoading" || p.kind === "PotSomeLoading";

export const isError = <A>(p: Pot<A>): p is NoneError | SomeError<A> =>
  p.kind === "PotNoneError" || p.kind === "PotSomeError";

export const toLoading = <T>(p: Pot<T>): SomeLoading<T> | NoneLoading =>
  isSome(p) ? someLoading(p.value) : noneLoading;

export const toError = <T>(p: Pot<T>, error: Error): NoneError | SomeError<T> =>
  isSome(p) ? someError(p.value, error) : noneError(error);

export const map = <A, B>(p: Pot<A>, f: (_: A) => B): Pot<B> =>
  isSome(p)
    ? {
        ...p,
        value: f(p.value)
      }
    : p;

export const getOrElse = <A>(p: Pot<A>, o: A): A => (isSome(p) ? p.value : o);

export const orElse = <A>(p: Pot<A>, o: Pot<A>): Pot<A> => (isSome(p) ? p : o);

export const toUndefined = <A>(p: Pot<A>): A | undefined =>
  isSome(p) ? p.value : undefined;

export const toOption = <A>(p: Pot<A>): option.Option<A> =>
  option.fromNullable(toUndefined(p));
