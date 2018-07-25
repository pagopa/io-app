import { fromEither, fromNullable } from "fp-ts/lib/Option";
import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber
} from "italia-ts-commons/lib/pagopa";
import { Amount } from "../../definitions/pagopa/Amount";
import { Psp } from "../../definitions/pagopa/Psp";
import { Transaction } from "../../definitions/pagopa/Transaction";
import {
  UNKNOWN_AMOUNT,
  UNKNOWN_DATE,
  UNKNOWN_NUMBER,
  UNKNOWN_PAYMENT_REASON,
  UNKNOWN_STRING
} from "./unknown";

const extractAmount = (amountObject: Amount | undefined): AmountInEuroCents =>
  // tslint:disable-next-line no-inferred-empty-object-type
  fromNullable(amountObject) // amountObject.amount is an Amount, which is defined as { amount?: number, ... }
    .mapNullable(a => a.amount) // if a.amount (i.e. amountObject.amount.amount) is undefined => None
    .chain(
      // if the value was extracted, map it to an AmountInEuroCents
      amount => fromEither(AmountInEuroCentsFromNumber.decode(amount / 100)) // the amount in Amount is stored in cents by pagoPA
    )
    .getOrElse(UNKNOWN_AMOUNT); // if anything went wrong, revert to UNKNOWN_AMOUNT

/**
 * Transaction extractors
 */

export const getTransactionCreationDate = (t: Transaction): Date =>
  fromNullable(t.created).getOrElse(UNKNOWN_DATE);

export const getTransactionAmount = (t: Transaction): AmountInEuroCents =>
  extractAmount(t.amount);

export const getTransactionFee = (t: Transaction): AmountInEuroCents =>
  extractAmount(t.fee);

export const getTransactionPaymentReason = (t: Transaction): string =>
  fromNullable(t.description).getOrElse(UNKNOWN_PAYMENT_REASON);

export const getTransactionRecipient = (t: Transaction): string =>
  fromNullable(t.merchant).getOrElse(UNKNOWN_STRING);

export const getTransactionWalletId = (t: Transaction): number =>
  fromNullable(t.idWallet).getOrElse(UNKNOWN_NUMBER);

export const getTransactionId = (t: Transaction): number =>
  fromNullable(t.id).getOrElse(UNKNOWN_NUMBER);

/**
 * Psp extractors
 */

export const getPspId = (p: Psp): number =>
  fromNullable(p.id).getOrElse(UNKNOWN_NUMBER);

export const getPspLogoUrl = (p: Psp): string =>
  fromNullable(p.logoPSP).getOrElse(UNKNOWN_STRING);

export const getPspFee = (p: Psp): AmountInEuroCents =>
  extractAmount(p.fixedCost);
