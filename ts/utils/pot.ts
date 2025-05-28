import * as pot from "@pagopa/ts-commons/lib/pot";

// type alias of pot.Some to make possible type guard, since pot.Some is not exported
interface Some<T> {
  readonly kind: "PotSome";
  readonly value: T;
}
// type alias of pot.SomeError to make possible type guard, since pot.Some is not exported
interface SomeError<T, E> {
  readonly kind: "PotSomeError";
  readonly value: T;
  readonly error: E;
}

// return true if pot is just None, not NoneLoading, nor NoneUpdating, nor NoneError
export const isStrictNone = <T, E>(p: pot.Pot<T, E>): boolean =>
  pot.isNone(p) && !pot.isLoading(p) && !pot.isUpdating(p) && !pot.isError(p);

// return true if pot is some and not someError and not someLoading
export const isStrictSome = <T, E>(p: pot.Pot<T, E>): p is Some<T> =>
  p.kind === "PotSome";

export const foldK =
  <A, E, O>(
    foldNone: () => O,
    foldNoneLoading: () => O,
    foldNoneUpdating: (newValue: A) => O,
    foldNoneError: (error: E) => O,
    foldSome: (value: A) => O,
    foldSomeLoading: (value: A) => O,
    foldSomeUpdating: (value: A, newValue: A) => O,
    foldSomeError: (value: A, error: E) => O
  ) =>
  (input: pot.Pot<A, E>) =>
    pot.fold(
      input,
      foldNone,
      foldNoneLoading,
      foldNoneUpdating,
      foldNoneError,
      foldSome,
      foldSomeLoading,
      foldSomeUpdating,
      foldSomeError
    );

export const isStrictSomeError = <A, E>(
  p: pot.Pot<A, E>
): p is SomeError<A, E> => pot.isSome(p) && pot.isError(p);
export const isSomeLoadingOrSomeUpdating = <A, E>(p: pot.Pot<A, E>): boolean =>
  pot.isSome(p) && (pot.isLoading(p) || pot.isUpdating(p));
export const isSomeOrSomeError = <A, E>(
  p: pot.Pot<A, E>
): p is Some<A> | SomeError<A, E> =>
  pot.isSome(p) && !pot.isLoading(p) && !pot.isUpdating(p);
export const isLoadingOrUpdating = <A, E>(p: pot.Pot<A, E>): boolean =>
  pot.isLoading(p) || pot.isUpdating(p);

type PotFoldWithDefaultHandlers<A, E, O> = {
  none?: () => O;
  noneLoading?: () => O;
  noneUpdating?: (newValue: A) => O;
  noneError?: (error: E) => O;
  some?: (value: A) => O;
  someLoading?: (value: A) => O;
  someUpdating?: (value: A, newValue: A) => O;
  someError?: (value: A, error: E) => O;
} & {
  default: (value?: A | E, secondValue?: A | E) => O;
};

/**
 * Fold a {@link pot.Pot} using a fallback default function
 * @param value
 * @param handlers {PotFoldWithDefaultHandlers}
 *
 * The default handler will be called if any of the args is not defined,
 * and will have two optional parameters, which can be *some* or *error*
 *
 */
export const potFoldWithDefault = <A, E, O>(
  value: pot.Pot<A, E>,
  handlers: PotFoldWithDefaultHandlers<A, E, O>
) =>
  pot.fold(
    value,
    handlers.none ?? handlers.default,
    handlers.noneLoading ?? handlers.default,
    handlers.noneUpdating ?? handlers.default,
    handlers.noneError ?? handlers.default,
    handlers.some ?? handlers.default,
    handlers.someLoading ?? handlers.default,
    handlers.someUpdating ?? handlers.default,
    handlers.someError ?? handlers.default
  );

export const toUndefinedOptional = <T, E>(input: pot.Pot<T, E> | undefined) =>
  input != null ? pot.toUndefined(input) : undefined;
