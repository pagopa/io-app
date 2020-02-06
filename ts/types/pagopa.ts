import * as t from "io-ts";
import {
  ReplaceProp1,
  replaceProp1 as repP,
  requiredProp1 as reqP,
  tag
} from "italia-ts-commons/lib/types";

import { Amount as AmountPagoPA } from "../../definitions/pagopa/Amount";
import { CreditCard as CreditCardPagoPA } from "../../definitions/pagopa/CreditCard";
import { Pay as PayPagoPA } from "../../definitions/pagopa/Pay";
import { PayRequest as PayRequestPagoPA } from "../../definitions/pagopa/PayRequest";
import { Psp as PspPagoPA } from "../../definitions/pagopa/Psp";
import { PspListResponseCD as PspListResponsePagoPA } from "../../definitions/pagopa/PspListResponseCD";
import { PspResponse as PspResponsePagoPA } from "../../definitions/pagopa/PspResponse";
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

/**
 * Union of all possible credit card types
 */
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

/**
 * A refined CreditCard type
 */
export const CreditCard = repP(
  repP(
    repP(
      repP(
        reqP(CreditCardPagoPA, "holder"),
        "expireMonth",
        CreditCardExpirationMonth
      ),
      "expireYear",
      CreditCardExpirationYear
    ),
    "pan",
    CreditCardPan
  ),
  "securityCode",
  t.union([CreditCardCVC, t.undefined]),
  "CreditCard"
);

export type CreditCard = t.TypeOf<typeof CreditCard>;

/**
 * An refined Amount
 *
 * We are using EUR and 2 decimal digits anyway, so
 * "currency" and "decimalDigits" can safely be ignored
 */
export const Amount = reqP(AmountPagoPA, "amount", "Amount");
export type Amount = t.TypeOf<typeof Amount>;

/**
 * A refined Psp
 */
export const Psp = repP(
  reqP(reqP(PspPagoPA, "id"), "logoPSP"),
  "fixedCost",
  Amount,
  "Psp"
);
export type Psp = t.TypeOf<typeof Psp>;

/**
 * A refined Wallet
 */
export const Wallet = repP(
  repP(
    reqP(reqP(WalletPagoPA, "idWallet"), "type"),
    "creditCard",
    t.union([CreditCard, t.undefined])
  ),
  "psp",
  t.union([Psp, t.undefined]),
  "Wallet"
);
export type Wallet = t.TypeOf<typeof Wallet>;

/**
 * A Wallet that has not being saved yet
 */
export type NullableWallet = ReplaceProp1<Wallet, "idWallet", null>;

/**
 * A refined Transaction
 */
export const Transaction = repP(
  repP(
    repP(
      reqP(
        reqP(
          reqP(
            reqP(
              reqP(
                reqP(reqP(TransactionPagoPA, "created"), "description"),
                "id"
              ),
              "idPayment"
            ),
            "idWallet"
          ),
          "merchant"
        ),
        "statusMessage"
      ),
      "amount",
      Amount
    ),
    "fee",
    t.union([Amount, t.undefined])
  ),
  "grandTotal",
  Amount,
  "Transaction"
);

export type Transaction = t.TypeOf<typeof Transaction>;

export const isCompletedTransaction = (tx: Transaction) => tx.idStatus === 3;

/**
 * accountingStatus === 1 means the transaction has been
 * confirmed and the payment has been successfully
 * completed
 */
export const isSuccessTransaction = (tx: Transaction) =>
  tx.accountingStatus === 1;

/**
 * A refined TransactionListResponse
 */
export const TransactionListResponse = repP(
  TransactionListResponsePagoPA,
  "data",
  t.readonlyArray(Transaction),
  "TransactionListResponse"
);

export type TransactionListResponse = t.TypeOf<typeof TransactionListResponse>;

/**
 * A refined WalletListResponse
 */
export const WalletListResponse = repP(
  WalletListResponsePagoPA,
  "data",
  t.readonlyArray(Wallet),
  "WalletListResponse"
);

export type WalletListResponse = t.TypeOf<typeof WalletListResponse>;

/**
 * A tagged string type for the PagoPA SessionToken
 */

interface IPaymentManagerTokenTag {
  kind: "IPaymentManagerTokenTag";
}

export const PaymentManagerToken = tag<IPaymentManagerTokenTag>()(t.string);
export type PaymentManagerToken = t.TypeOf<typeof PaymentManagerToken>;

/**
 * A Session
 */
export const Session = repP(
  reqP(SessionPagoPA, "sessionToken"),
  "sessionToken",
  PaymentManagerToken,
  "Session"
);

export type Session = t.TypeOf<typeof Session>;

/**
 * A refined SessionResponse
 */
export const SessionResponse = repP(
  SessionResponsePagoPA,
  "data",
  Session,
  "SessionResponse"
);

export type SessionResponse = t.TypeOf<typeof SessionResponse>;

/**
 * A refined PspListResponse
 */
export const PspListResponse = repP(
  PspListResponsePagoPA,
  "data",
  t.readonlyArray(Psp),
  "PspListResponse"
);

export type PspListResponse = t.TypeOf<typeof PspListResponse>;

/**
 * A refined WalletResponse
 */
export const WalletResponse = repP(
  WalletResponsePagoPA,
  "data",
  Wallet,
  "WalletResponse"
);

export type WalletResponse = t.TypeOf<typeof WalletResponse>;

/**
 * A refined TransactionResponse
 */
export const TransactionResponse = repP(
  TransactionResponsePagoPA,
  "data",
  Transaction,
  "TransactionResponse"
);

export type TransactionResponse = t.TypeOf<typeof TransactionResponse>;

/**
 * A refined PspResponse
 */
export const PspResponse = repP(PspResponsePagoPA, "data", Psp, "PspResponse");

export type PspResponse = t.TypeOf<typeof PspResponse>;

/**
 * A refined Pay
 */
const Pay = repP(reqP(PayPagoPA, "idWallet"), "tipo", t.literal("web"), "Pay");

type Pay = t.TypeOf<typeof Pay>;

/**
 * A refined PayRequest
 */
export const PayRequest = repP(PayRequestPagoPA, "data", Pay, "PayRequest");

export type PayRequest = t.TypeOf<typeof PayRequest>;

export const PagoPAErrorResponse = t.type({
  code: t.string,
  message: t.string
});

export type PagoPAErrorResponse = t.TypeOf<typeof PagoPAErrorResponse>;
