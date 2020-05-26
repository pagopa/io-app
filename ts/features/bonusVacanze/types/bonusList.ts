import * as t from "io-ts";
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import { Timestamp } from "../../../../definitions/backend/Timestamp";

const BonusItemR = t.interface({
  id: NonNegativeInteger,
  name: t.string,
  description: t.string,
  valid_from: Timestamp,
  valid_to: Timestamp
});
const BonusItemO = t.partial({
  cover: t.string
});
export const BonusItem = t.intersection([BonusItemR, BonusItemO], "BonusItem");
const BonusListR = t.interface({
  items: t.readonlyArray(BonusItem, "array of Bonus")
});
const BonusListRO = t.partial({});
const BonusList = t.intersection([BonusListR, BonusListRO], "BonusList");
export type BonusList = t.TypeOf<typeof BonusList>;
