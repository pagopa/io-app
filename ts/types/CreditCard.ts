import { UNKNOWN_CARD_PAN } from "./unknown";
/**
 * Definition of the CreditCard type, with the
 * properties required for UI purposes.
 */
// TODO: this type may need to be aligned with the PagoPA one
// @https://www.pivotaltracker.com/story/show/157769657

import * as t from "io-ts";
import { tag } from "italia-ts-commons/lib/types";
import { Wallet } from "../../definitions/pagopa/Wallet";

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

export const getCardType = (w: Wallet): CreditCardType =>
  w.creditCard !== undefined
    ? CreditCardType.decode(w.creditCard.brandLogo).getOrElse(
        "UNKNOWN" as CreditCardType
      )
    : "UNKNOWN";

export const getCardId = (w: Wallet): number => w.id;

export const getCardPan = (w: Wallet): string =>
  w.creditCard === undefined
    ? UNKNOWN_CARD_PAN
    : w.creditCard.pan === undefined
      ? UNKNOWN_CARD_PAN
      : w.creditCard.pan;

export const getCardLastUsage = (w: Wallet): string =>
  w.lastUsage === undefined ? "?" : w.lastUsage;

export const getCardExpirationDate = (w: Wallet): string =>
  w.creditCard === undefined
    ? "00/00"
    : w.creditCard.expireMonth === undefined ||
      w.creditCard.expireYear === undefined
      ? "00/00"
      : `${w.creditCard.expireMonth}/${w.creditCard.expireYear}`;

export const getCardHolder = (w: Wallet): string =>
  w.creditCard === undefined
    ? "NO HOLDER"
    : w.creditCard.holder === undefined
      ? "NO HOLDER"
      : w.creditCard.holder;
