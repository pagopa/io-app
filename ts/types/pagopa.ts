import * as t from "io-ts";
import { Amount as AmountPagoPA } from "../../definitions/pagopa/Amount";
import { CreditCard as CreditCardPagoPA } from "../../definitions/pagopa/CreditCard";
import { Psp as PspPagoPA } from "../../definitions/pagopa/Psp";
import { Transaction as TransactionPagoPA } from "../../definitions/pagopa/Transaction";
import { TransactionListResponse as TransactionListResponsePagoPA } from "../../definitions/pagopa/TransactionListResponse";
import { Wallet as WalletPagoPA } from "../../definitions/pagopa/Wallet";
import { WalletListResponse as WalletListResponsePagoPA } from "../../definitions/pagopa/WalletListResponse";

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

export const CreditCard = t.refinement(
  CreditCardPagoPA,
  c =>
    CreditCardType.is(c.brandLogo) &&
    c.expireMonth !== undefined &&
    c.expireYear !== undefined &&
    c.holder !== undefined &&
    c.id !== undefined &&
    c.pan !== undefined
);
type RequiredCreditCardFields = "expireMonth" | "expireYear" | "holder" | "pan"; // required fields
type UpdatedCreditCardFields = "brandLogo"; // required fields whose type needs to be updated
export type CreditCard = {
  // all the properties but for "brandLogo" (whose type needs to be changed)
  [key in Exclude<
    keyof CreditCardPagoPA,
    UpdatedCreditCardFields
  >]?: CreditCardPagoPA[key]
} &
  // set the optional properties that are actually required as "required"
  Required<Pick<CreditCardPagoPA, RequiredCreditCardFields>> &
  // redefined brandLogo so as to have the correct type (and be required)
  Readonly<{
    brandLogo: CreditCardType;
  }>;

// using EUR and 2 decimal digits anyway, so
// those two fields (currency, decimalDigits)
// can be ignored
export const Amount = t.refinement(AmountPagoPA, a => a.amount !== undefined);
type RequiredAmountFields = "amount";
export type Amount = AmountPagoPA &
  Required<Pick<AmountPagoPA, RequiredAmountFields>>;

export const Psp = t.refinement(
  PspPagoPA,
  p => Amount.is(p.fixedCost) && p.id !== undefined && p.logoPSP !== undefined
);
type RequiredPspFields = "id" | "logoPSP";
type UpdatedPspFields = "fixedCost";
export type Psp = {
  [key in Exclude<keyof PspPagoPA, UpdatedPspFields>]?: PspPagoPA[key]
} &
  Required<Pick<PspPagoPA, RequiredPspFields>> &
  Readonly<{
    fixedCost: Amount;
  }>;

export const Wallet = t.refinement(
  WalletPagoPA,
  w =>
    CreditCard.is(w.creditCard) &&
    w.idWallet !== undefined &&
    w.type !== undefined &&
    Psp.is(w.psp)
);
type RequiredWalletFields = "idWallet" | "type";
type UpdatedWalletFields = "creditCard" | "psp";
export type Wallet = {
  [key in Exclude<keyof WalletPagoPA, UpdatedWalletFields>]?: WalletPagoPA[key]
} &
  Required<Pick<WalletPagoPA, RequiredWalletFields>> &
  Readonly<{
    creditCard: CreditCard;
    psp: Psp;
  }>;

export const Transaction = t.refinement(
  TransactionPagoPA,
  tr =>
    Amount.is(tr.amount) &&
    tr.created !== undefined &&
    tr.description !== undefined &&
    Amount.is(tr.fee) &&
    Amount.is(tr.grandTotal) &&
    tr.id !== undefined &&
    tr.idPayment !== undefined &&
    tr.idWallet !== undefined &&
    tr.merchant !== undefined
);
type RequiredTransactionFields =
  | "created"
  | "description"
  | "id"
  | "idPayment"
  | "idWallet"
  | "merchant";
type UpdatedTransactionFields = "amount" | "fee" | "grandTotal";
export type Transaction = {
  // all the properties but for the ones that are changing type
  [key in Exclude<
    keyof TransactionPagoPA,
    UpdatedTransactionFields
  >]?: TransactionPagoPA[key]
} &
  // setting these as required
  Required<Pick<TransactionPagoPA, RequiredTransactionFields>> &
  // changing type (to the new "Amount") and setting are required
  Readonly<{
    amount: Amount;
    fee: Amount;
    grandTotal: Amount;
  }>;

// the response when requesting a list of transactions
export const TransactionListResponse = t.refinement(
  TransactionListResponsePagoPA,
  tlr => tlr.data !== undefined
);
type RequiredTransactionListResponseFields = "data";
export type TransactionListResponse = {
  [key in Exclude<
    keyof TransactionListResponsePagoPA,
    RequiredTransactionListResponseFields
  >]?: TransactionListResponsePagoPA[key]
} &
  Readonly<{
    data: ReadonlyArray<Transaction>;
  }>;

export const WalletListResponse = t.refinement(
  WalletListResponsePagoPA,
  wlr => wlr.data !== undefined
);
type RequiredWalletListResponseFields = "data";
export type WalletListResponse = {
  [key in Exclude<
    keyof WalletListResponsePagoPA,
    RequiredWalletListResponseFields
  >]?: WalletListResponsePagoPA[key]
} &
  Readonly<{
    data: ReadonlyArray<Wallet>;
  }>;
