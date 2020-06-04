/**
 * TEMPORARY TYPE DEFINITION
 * this type must be replaced with the one auto-generated from spec
 */
import * as t from "io-ts";
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import { Timestamp } from "../../../../definitions/backend/Timestamp";

const BonusItemR = t.interface({
  id_type: NonNegativeInteger,
  name: t.string,
  active: t.boolean,
  description: t.string,
  valid_from: Timestamp,
  valid_to: Timestamp
});
const BonusItemO = t.partial({
  cover: t.string
});
const BonusItemC = t.partial({
  service_id: t.string
});
export const BonusItemT = t.intersection(
  [BonusItemR, BonusItemO, BonusItemC],
  "BonusItem"
);
const BonusListR = t.interface({
  items: t.readonlyArray(BonusItemT, "array of Bonus")
});
const BonusListRO = t.partial({});
export const BonusListT = t.intersection(
  [BonusListR, BonusListRO],
  "BonusList"
);
export type BonusList = t.TypeOf<typeof BonusListT>;
export type BonusItem = t.TypeOf<typeof BonusItemT>;
