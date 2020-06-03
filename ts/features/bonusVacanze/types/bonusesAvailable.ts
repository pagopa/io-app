/**
 * TEMPORARY TYPE DEFINITION
 * this type must be replaced with the one auto-generated from spec
 */
import * as t from "io-ts";
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import { Timestamp } from "../../../../definitions/backend/Timestamp";

const BonusAvailableR = t.interface({
  id_type: NonNegativeInteger,
  name: t.string,
  active: t.boolean,
  description: t.string,
  valid_from: Timestamp,
  valid_to: Timestamp
});
const BonusAvailableO = t.partial({
  cover: t.string,
  service_id: t.string
});
export const BonusAvailableCodec = t.intersection(
  [BonusAvailableR, BonusAvailableO],
  "BonusItem"
);
const BonusListR = t.interface({
  items: t.readonlyArray(BonusAvailableCodec, "array of available bonuses")
});
const BonusListRO = t.partial({});
export const BonusesAvailableCodec = t.intersection(
  [BonusListR, BonusListRO],
  "BonusList"
);
export type BonusesAvailable = t.TypeOf<typeof BonusesAvailableCodec>;
export type BonusAvailable = t.TypeOf<typeof BonusAvailableCodec>;
