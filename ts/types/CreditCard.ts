/**
 * Definition of the CreditCard type, with the
 * properties required for UI purposes.
 */
// TODO: this type may need to be aligned with the PagoPA one
// @https://www.pivotaltracker.com/story/show/157769657

import * as t from "io-ts";
import { NonEmptyString, PatternString } from "italia-ts-commons/lib/strings";
import { tag } from "italia-ts-commons/lib/types";

interface ICreditCardIdTag {
  readonly kind: "CreditCardId";
}

export const CreditCardId = tag<ICreditCardIdTag>()(t.number);
export type CreditCardId = t.TypeOf<typeof CreditCardId>;

export const CreditCardType = t.union([
  t.literal("VISAELECTRON"),
  t.literal("MAESTRO"),
  t.literal("UNIONPAY"),
  t.literal("VISA"),
  t.literal("MASTERCARD"),
  t.literal("AMEX"),
  t.literal("DINERS"),
  t.literal("DISCOVER"),
  t.literal("JCB"),
  t.literal("POSTEPAY"),
  t.literal("UNKNOWN")
]);
export type CreditCardType = t.TypeOf<typeof CreditCardType>;

const CreditCard = t.type({
  id: CreditCardId,
  lastUsage: NonEmptyString,
  pan: PatternString("^[0-9]+$"),
  holder: NonEmptyString,
  expirationDate: NonEmptyString,
  brandLogo: CreditCardType
});
export type CreditCard = t.TypeOf<typeof CreditCard>;

export const UNKNOWN_CARD: CreditCard = {
  holder: "?" as NonEmptyString,
  pan: "0000000000000000",
  expirationDate: "??/??" as NonEmptyString,
  id: -1 as CreditCardId,
  lastUsage: "?" as NonEmptyString,
  brandLogo: "UNKNOWN"
};

export const getCardType = (cc: CreditCard): CreditCardType => cc.brandLogo;
