// Utility methods not included in the pot library

import * as pot from "italia-ts-commons/lib/pot";

export function resetPotStatus<T, E>(p: pot.Pot<T, E>): pot.Pot<T, E> {
  if (pot.isSome(p)) {
    return pot.some(p.value);
  } else {
    return pot.none;
  }
}
