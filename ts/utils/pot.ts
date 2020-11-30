import * as pot from "italia-ts-commons/lib/pot";

// return true if pot is some and not someError and not someLoading
export const isStrictSome = <T, E>(p: pot.Pot<T, E>) =>
  pot.isSome(p) && !pot.isError(p) && !pot.isLoading(p);
