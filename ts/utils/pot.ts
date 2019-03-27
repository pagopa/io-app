// Utility methods not included in the pot library
import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";

type PotKinds = { [index in pot.Pot<any, any>["kind"]]: 0 };

const PotKinds: PotKinds = {
  PotNone: 0,
  PotNoneLoading: 0,
  PotNoneUpdating: 0,
  PotNoneError: 0,
  PotSome: 0,
  PotSomeLoading: 0,
  PotSomeUpdating: 0,
  PotSomeError: 0
};

export function valueAsPotSomeOrNone(item: any): Option<pot.Pot<any, any>> {
  // Check it the item is an object with a structure like a pot.Pot
  if (
    item !== null &&
    typeof item === "object" &&
    item.kind !== undefined &&
    item.kind in PotKinds
  ) {
    return item.value !== undefined
      ? some(pot.some(item.value)) // We have a value return pot.Some
      : some(pot.none); // No value return pot.None
  }
  return none;
}
