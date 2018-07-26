import {
  UNKNOWN_CARD_HOLDER,
  UNKNOWN_CARD_PAN,
  UNKNOWN_EXPIRATION_DATE,
  UNKNOWN_LAST_USAGE,
  UNKNWON_CARD_TYPE
} from "./unknown";
// TODO: define the correct terminology (card vs wallet and when) @https://www.pivotaltracker.com/story/show/159229359

import { fromEither, fromNullable, none, some } from "fp-ts/lib/Option";
import * as t from "io-ts";
import { tag } from "italia-ts-commons/lib/types";
import { Wallet } from "../../definitions/pagopa/Wallet";
import I18n from "../i18n";
import { convertDateToWordDistance } from "../utils/convertDateToWordDistance";

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
  fromNullable(w.creditCard) // tslint:disable no-inferred-empty-object-type (WIP: any clue as to why this occurs?)
    .chain(card => fromEither(CreditCardType.decode(card.brandLogo)))
    .getOrElse(UNKNWON_CARD_TYPE);

export const getWalletId = (w: Wallet): number =>
  fromNullable(w.idWallet).getOrElse(-1);

export const getCardPan = (w: Wallet): string =>
  fromNullable(w.creditCard)
    .chain(card => fromNullable(card.pan))
    .getOrElse(UNKNOWN_CARD_PAN);

export const getCardLastUsage = (w: Wallet): Date =>
  fromNullable(w.lastUsage).getOrElse(UNKNOWN_LAST_USAGE);

export const getCardFormattedLastUsage = (w: Wallet): string => {
  const neverString = "never";
  const lastUsageString = convertDateToWordDistance(
    getCardLastUsage(w),
    I18n.t("datetimes.yesterday"),
    I18n.t("datetimes.todayAt"),
    neverString
  );
  return lastUsageString === neverString
    ? I18n.t("cardComponent.neverUsed")
    : `${I18n.t("cardComponent.lastUsage")} ${lastUsageString}`;
};

export const getCardExpirationDate = (w: Wallet): string =>
  fromNullable(w.creditCard)
    .chain(card => {
      const values: ReadonlyArray<any> = [
        fromNullable(card.expireMonth),
        fromNullable(card.expireYear)
      ];
      if (values.every(v => v.isSome())) {
        return some(values.map(v => v.value).join("/"));
      }
      return none;
    })
    .getOrElse(UNKNOWN_EXPIRATION_DATE);

export const getCardHolder = (w: Wallet): string =>
  fromNullable(w.creditCard)
    .chain(card => fromNullable(card.holder))
    .getOrElse(UNKNOWN_CARD_HOLDER);
