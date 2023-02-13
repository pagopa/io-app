import * as pot from "@pagopa/ts-commons/lib/pot";

// type alias of pot.Some to make possible type guard, since pot.Some is not exported
interface Some<T> {
  readonly kind: "PotSome";
  readonly value: T;
}

// return true if pot is just None, not NoneLoading, nor NoneUpdating, nor NoneError
export const isStrictNone = <T, E>(p: pot.Pot<T, E>): boolean =>
  pot.isNone(p) && !pot.isLoading(p) && !pot.isUpdating(p) && !pot.isError(p);

// return true if pot is some and not someError and not someLoading
export const isStrictSome = <T, E>(p: pot.Pot<T, E>): p is Some<T> =>
  p.kind === "PotSome";
