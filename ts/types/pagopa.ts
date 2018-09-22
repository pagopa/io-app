import * as t from "io-ts";
import { Amount as AmountPagoPA } from "../../definitions/pagopa/Amount";
import { CreditCard as CreditCardPagoPA } from "../../definitions/pagopa/CreditCard";
import { Pay as PayPagoPA } from "../../definitions/pagopa/Pay";
import { PayRequest as PayRequestPagoPA } from "../../definitions/pagopa/PayRequest";
import { Psp as PspPagoPA } from "../../definitions/pagopa/Psp";
import { PspListResponse as PspListResponsePagoPA } from "../../definitions/pagopa/PspListResponse";
import { Session as SessionPagoPA } from "../../definitions/pagopa/Session";
import { SessionResponse as SessionResponsePagoPA } from "../../definitions/pagopa/SessionResponse";
import { Transaction as TransactionPagoPA } from "../../definitions/pagopa/Transaction";
import { TransactionListResponse as TransactionListResponsePagoPA } from "../../definitions/pagopa/TransactionListResponse";
import { TransactionResponse as TransactionResponsePagoPA } from "../../definitions/pagopa/TransactionResponse";
import { Wallet as WalletPagoPA } from "../../definitions/pagopa/Wallet";
import { WalletListResponse as WalletListResponsePagoPA } from "../../definitions/pagopa/WalletListResponse";
import { WalletResponse as WalletResponsePagoPA } from "../../definitions/pagopa/WalletResponse";

import {
  CreditCardCVC,
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan
} from "../utils/input";

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
    c.brandLogo !== undefined &&
    CreditCardExpirationMonth.is(c.expireMonth) &&
    CreditCardExpirationYear.is(c.expireYear) &&
    c.holder !== undefined &&
    CreditCardPan.is(c.pan) &&
    (c.securityCode === undefined || CreditCardCVC.is(c.securityCode))
);
type RequiredCreditCardFields = "holder"; // required field
type UpdatedCreditCardFields = "expireMonth" | "expireYear" | "pan"; // update fields

export type CreditCard = Pick<
  CreditCardPagoPA,
  Exclude<keyof CreditCardPagoPA, UpdatedCreditCardFields>
> &
  Required<Pick<CreditCardPagoPA, RequiredCreditCardFields>> &
  Readonly<{
    expireMonth: CreditCardExpirationMonth;
    expireYear: CreditCardExpirationYear;
    pan: CreditCardPan;
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
export type Psp = Pick<PspPagoPA, Exclude<keyof PspPagoPA, UpdatedPspFields>> &
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
    (w.psp === undefined || Psp.is(w.psp)) &&
    w.lastUsage !== undefined // when a card is created, it is "used" immediately, so this will never be empty
);
type RequiredWalletFields = "idWallet" | "lastUsage";
type UpdatedWalletFields = "creditCard" | "psp" | "type";
export type Wallet = Pick<
  WalletPagoPA,
  Exclude<keyof WalletPagoPA, UpdatedWalletFields>
> &
  Required<Pick<WalletPagoPA, RequiredWalletFields>> &
  Readonly<{
    creditCard: CreditCard;
    psp?: Psp;
    type: "CREDIT_CARD";
  }>;

type WalletNullableFields = "idWallet" | "favourite" | "lastUsage";
export type NullableWallet = Pick<
  Wallet,
  Exclude<keyof Wallet, WalletNullableFields>
> &
  Readonly<{
    idWallet: null;
    favourite: null;
    lastUsage: null;
  }>;

export const Transaction = t.refinement(
  TransactionPagoPA,
  tr =>
    Amount.is(tr.amount) &&
    tr.created !== undefined &&
    tr.description !== undefined &&
    (tr.fee === undefined || Amount.is(tr.fee)) &&
    Amount.is(tr.grandTotal) &&
    tr.id !== undefined &&
    tr.idPayment !== undefined &&
    tr.idWallet !== undefined &&
    tr.merchant !== undefined &&
    tr.statusMessage !== undefined
);
type RequiredTransactionFields =
  | "created"
  | "description"
  | "id"
  | "idPayment"
  | "idWallet"
  | "merchant";
type UpdatedTransactionFields = "amount" | "fee" | "grandTotal";
export type Transaction =
  // all the properties but for the ones that are changing type
  Pick<
    TransactionPagoPA,
    Exclude<keyof TransactionPagoPA, UpdatedTransactionFields>
  > &
    // setting these as required
    Required<Pick<TransactionPagoPA, RequiredTransactionFields>> &
    // changing type (to the new "Amount") and setting are required
    Readonly<{
      amount: Amount;
      fee?: Amount; // pagoPA isn't providing the "fee" field"
      grandTotal: Amount;
      statusMessage: "rifiutato" | "Confermato" | string; // TODO: get a complete list of statuses from pagoPA
    }>;

// the response when requesting a list of transactions
export const TransactionListResponse = t.refinement(
  TransactionListResponsePagoPA,
  tlr => t.readonlyArray(Transaction).is(tlr.data)
);
type UpdatedTransactionListResponseFields = "data";
export type TransactionListResponse = Pick<
  TransactionListResponsePagoPA,
  Exclude<
    keyof TransactionListResponsePagoPA,
    UpdatedTransactionListResponseFields
  >
> &
  Readonly<{
    data: ReadonlyArray<Transaction>;
  }>;

export const WalletListResponse = t.refinement(WalletListResponsePagoPA, wlr =>
  t.readonlyArray(Wallet).is(wlr.data)
);
type UpdatedWalletListResponseFields = "data";
export type WalletListResponse = Pick<
  WalletListResponsePagoPA,
  Exclude<keyof WalletListResponsePagoPA, UpdatedWalletListResponseFields>
> &
  Readonly<{
    data: ReadonlyArray<Wallet>;
  }>;

export const Session = t.refinement(
  SessionPagoPA,
  s => s.sessionToken !== undefined
);
type RequiredSessionFields = "sessionToken";
export type Session = SessionPagoPA &
  Required<Pick<SessionPagoPA, RequiredSessionFields>>;

export const SessionResponse = t.refinement(SessionResponsePagoPA, sr =>
  Session.is(sr.data)
);
type UpdatedSessionResponseFields = "data";
export type SessionResponse = Pick<
  SessionResponsePagoPA,
  Exclude<keyof SessionResponsePagoPA, UpdatedSessionResponseFields>
> &
  Readonly<{
    data: Session;
  }>;

export const PspListResponse = t.refinement(PspListResponsePagoPA, plr =>
  t.readonlyArray(Psp).is(plr.data)
);
type UpdatedPspListResponseFields = "data";
export type PspListResponse = Pick<
  PspListResponsePagoPA,
  Exclude<keyof PspListResponsePagoPA, UpdatedPspListResponseFields>
> &
  Readonly<{
    data: ReadonlyArray<Psp>;
  }>;

export const WalletResponse = t.refinement(WalletResponsePagoPA, wr =>
  Wallet.is(wr.data)
);
type UpdatedWalletResponseFields = "data";
export type WalletResponse = Pick<
  WalletResponsePagoPA,
  Exclude<keyof WalletResponsePagoPA, UpdatedWalletResponseFields>
> &
  Readonly<{
    data: Wallet;
  }>;

export const TransactionResponse = t.refinement(TransactionResponsePagoPA, tr =>
  Transaction.is(tr.data)
);
type UpdatedTransactionResponseFields = "data";
export type TransactionResponse = Pick<
  TransactionResponsePagoPA,
  Exclude<keyof TransactionResponsePagoPA, UpdatedTransactionResponseFields>
> &
  Readonly<{
    data: Transaction;
  }>;

const Pay = t.refinement(
  PayPagoPA,
  p => p.idWallet !== undefined && p.tipo === "web"
);
type RequiredPayFields = "idWallet";
type UpdatedPayFields = "tipo";
type Pay = Pick<PayPagoPA, Exclude<keyof PayPagoPA, UpdatedPayFields>> &
  Required<Pick<PayPagoPA, RequiredPayFields>> &
  Readonly<{
    tipo: "web";
  }>;

export const PayRequest = t.refinement(PayRequestPagoPA, pr => Pay.is(pr.data));
type UpdatedPayRequestFields = "data";
export type PayRequest = Pick<
  PayRequestPagoPA,
  Exclude<keyof PayRequestPagoPA, UpdatedPayRequestFields>
> &
  Readonly<{
    data: Pay;
  }>;
