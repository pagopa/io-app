import * as t from "io-ts";

import { ReplaceProp1, RequiredProp1 } from "../types/utils";

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
export type CreditCard = ReplaceProp1<
  ReplaceProp1<
    ReplaceProp1<
      ReplaceProp1<
        RequiredProp1<RequiredProp1<CreditCardPagoPA, "holder">, "brandLogo">,
        "expireMonth",
        CreditCardExpirationMonth
      >,
      "expireYear",
      CreditCardExpirationYear
    >,
    "pan",
    CreditCardPan
  >,
  "securityCode",
  CreditCardCVC
>;

function isCreditCard(o: any): o is CreditCard {
  return (
    CreditCardPagoPA.is(o) &&
    (o.brandLogo !== undefined &&
      CreditCardExpirationMonth.is(o.expireMonth) &&
      CreditCardExpirationYear.is(o.expireYear) &&
      o.holder !== undefined &&
      CreditCardPan.is(o.pan) &&
      (o.securityCode === undefined || CreditCardCVC.is(o.securityCode)))
  );
}

export const CreditCard = new t.Type<CreditCard, typeof CreditCardPagoPA>(
  "CreditCard",
  isCreditCard,
  (i, c) => {
    const validation = CreditCardPagoPA.validate(i, c);
    if (validation.isLeft()) {
      // tslint:disable-next-line:no-useless-cast
      return validation as t.Validation<CreditCard>;
    }
    const value = validation.value;
    return isCreditCard(value) ? t.success(value) : t.failure(value, c);
  },
  // tslint:disable-next-line:no-useless-cast
  a => a as any
);

/**
 * An refined Amount
 *
 * We are using EUR and 2 decimal digits anyway, so
 * "currency" and "decimalDigits" can safely be ignored
 */
export type Amount = RequiredProp1<AmountPagoPA, "amount">;

function isAmount(o: any): o is Amount {
  return AmountPagoPA.is(o) && o.amount !== undefined;
}

export const Amount = new t.Type<Amount, typeof AmountPagoPA>(
  "Amount",
  isAmount,
  (i, c) => {
    const validation = AmountPagoPA.validate(i, c);
    if (validation.isLeft()) {
      // tslint:disable-next-line:no-useless-cast
      return validation as t.Validation<Amount>;
    }
    const value = validation.value;
    return isAmount(value) ? t.success(value) : t.failure(value, c);
  },
  // tslint:disable-next-line:no-useless-cast
  a => a as any
);

/**
 * A refined Psp
 */
export type Psp = ReplaceProp1<
  RequiredProp1<RequiredProp1<PspPagoPA, "id">, "logoPSP">,
  "fixedCost",
  Amount
>;

function isPsp(o: any): o is Psp {
  return (
    PspPagoPA.is(o) &&
    (Amount.is(o.fixedCost) && o.id !== undefined && o.logoPSP !== undefined)
  );
}

export const Psp = new t.Type<Psp, typeof PspPagoPA>(
  "Psp",
  isPsp,
  (i, c) => {
    const validation = PspPagoPA.validate(i, c);
    if (validation.isLeft()) {
      // tslint:disable-next-line:no-useless-cast
      return validation as t.Validation<Psp>;
    }
    const value = validation.value;
    return isPsp(value) ? t.success(value) : t.failure(value, c);
  },
  // tslint:disable-next-line:no-useless-cast
  a => a as any
);

/**
 * A refined Wallet
 */
export type Wallet = ReplaceProp1<
  ReplaceProp1<
    RequiredProp1<RequiredProp1<WalletPagoPA, "idWallet">, "type">,
    "creditCard",
    CreditCard
  >,
  "psp",
  Psp | undefined
>;

function isWallet(o: any): o is Wallet {
  return (
    WalletPagoPA.is(o) &&
    (CreditCard.is(o.creditCard) &&
      o.idWallet !== undefined &&
      o.type !== undefined &&
      (o.psp === undefined || Psp.is(o.psp)))
  );
}

export const Wallet = new t.Type<Wallet, typeof WalletPagoPA>(
  "Wallet",
  isWallet,
  (i, c) => {
    const validation = WalletPagoPA.validate(i, c);
    if (validation.isLeft()) {
      // tslint:disable-next-line:no-useless-cast
      return validation as t.Validation<Wallet>;
    }
    const value = validation.value;
    return isWallet(value) ? t.success(value) : t.failure(value, c);
  },
  // tslint:disable-next-line:no-useless-cast
  a => a as any
);

export type NullableWallet = ReplaceProp1<
  Wallet,
  "idWallet" | "favourite",
  null
>;

export type Transaction = ReplaceProp1<
  ReplaceProp1<
    ReplaceProp1<
      RequiredProp1<
        RequiredProp1<
          RequiredProp1<
            RequiredProp1<
              RequiredProp1<
                RequiredProp1<
                  RequiredProp1<TransactionPagoPA, "created">,
                  "description"
                >,
                "id"
              >,
              "idPayment"
            >,
            "idWallet"
          >,
          "merchant"
        >,
        "statusMessage"
      >,
      "amount",
      Amount
    >,
    "fee",
    Amount | undefined
  >,
  "grandTotal",
  Amount
>;

function isTransaction(o: any): o is Transaction {
  return (
    TransactionPagoPA.is(o) &&
    (Amount.is(o.amount) &&
      o.created !== undefined &&
      o.description !== undefined &&
      (o.fee === undefined || Amount.is(o.fee)) &&
      Amount.is(o.grandTotal) &&
      o.id !== undefined &&
      o.idPayment !== undefined &&
      o.idWallet !== undefined &&
      o.merchant !== undefined &&
      o.statusMessage !== undefined)
  );
}

export const Transaction = new t.Type<Transaction, typeof TransactionPagoPA>(
  "Transaction",
  isTransaction,
  (i, c) => {
    const validation = TransactionPagoPA.validate(i, c);
    if (validation.isLeft()) {
      // tslint:disable-next-line:no-useless-cast
      return validation as t.Validation<Transaction>;
    }
    const value = validation.value;
    return isTransaction(value) ? t.success(value) : t.failure(value, c);
  },
  // tslint:disable-next-line:no-useless-cast
  a => a as any
);

/**
 * A refined TransactionListResponse
 */
export type TransactionListResponse = ReplaceProp1<
  TransactionListResponsePagoPA,
  "data",
  ReadonlyArray<Transaction>
>;

function isTransactionListResponse(o: any): o is TransactionListResponse {
  return (
    TransactionListResponsePagoPA.is(o) &&
    t.readonlyArray(Transaction).is(o.data)
  );
}

export const TransactionListResponse = new t.Type<
  TransactionListResponse,
  typeof TransactionListResponsePagoPA
>(
  "TransactionListResponse",
  isTransactionListResponse,
  (i, c) => {
    const validation = TransactionListResponsePagoPA.validate(i, c);
    if (validation.isLeft()) {
      // tslint:disable-next-line:no-useless-cast
      return validation as t.Validation<TransactionListResponse>;
    }
    const value = validation.value;
    return isTransactionListResponse(value)
      ? t.success(value)
      : t.failure(value, c);
  },
  // tslint:disable-next-line:no-useless-cast
  a => a as any
);

/**
 * A refined WalletListResponse
 */
export type WalletListResponse = ReplaceProp1<
  WalletListResponsePagoPA,
  "data",
  ReadonlyArray<Wallet>
>;

function isWalletListResponse(o: any): o is WalletListResponse {
  return WalletListResponsePagoPA.is(o) && t.readonlyArray(Wallet).is(o.data);
}

export const WalletListResponse = new t.Type<
  WalletListResponse,
  typeof WalletListResponsePagoPA
>(
  "WalletListResponse",
  isWalletListResponse,
  (i, c) => {
    const validation = WalletListResponsePagoPA.validate(i, c);
    if (validation.isLeft()) {
      // tslint:disable-next-line:no-useless-cast
      return validation as t.Validation<WalletListResponse>;
    }
    const value = validation.value;
    return isWalletListResponse(value) ? t.success(value) : t.failure(value, c);
  },
  // tslint:disable-next-line:no-useless-cast
  a => a as any
);

/**
 * A Session
 */
export type Session = RequiredProp1<SessionPagoPA, "sessionToken">;

function isSession(o: any): o is Session {
  return SessionPagoPA.is(o) && o.sessionToken !== undefined;
}

export const Session = new t.Type<Session, typeof SessionPagoPA>(
  "Session",
  isSession,
  (i, c) => {
    const validation = SessionPagoPA.validate(i, c);
    if (validation.isLeft()) {
      // tslint:disable-next-line:no-useless-cast
      return validation as t.Validation<Session>;
    }
    const value = validation.value;
    return isSession(value) ? t.success(value) : t.failure(value, c);
  },
  // tslint:disable-next-line:no-useless-cast
  a => a as any
);

/**
 * A refined SessionResponse
 */
export type SessionResponse = ReplaceProp1<
  SessionResponsePagoPA,
  "data",
  Session
>;

function isSessionResponse(o: any): o is SessionResponse {
  return SessionResponsePagoPA.is(o) && Session.is(o.data);
}

export const SessionResponse = new t.Type<
  SessionResponse,
  typeof SessionResponsePagoPA
>(
  "SessionResponse",
  isSessionResponse,
  (i, c) => {
    const validation = SessionResponsePagoPA.validate(i, c);
    if (validation.isLeft()) {
      // tslint:disable-next-line:no-useless-cast
      return validation as t.Validation<SessionResponse>;
    }
    const value = validation.value;
    return isSessionResponse(value) ? t.success(value) : t.failure(value, c);
  },
  // tslint:disable-next-line:no-useless-cast
  a => a as any
);

/**
 * A refined PspListResponse
 */
export type PspListResponse = ReplaceProp1<
  PspListResponsePagoPA,
  "data",
  ReadonlyArray<Psp>
>;

function isPspListResponse(o: any): o is PspListResponse {
  return PspListResponsePagoPA.is(o) && t.readonlyArray(Psp).is(o.data);
}

export const PspListResponse = new t.Type<
  PspListResponse,
  typeof PspListResponsePagoPA
>(
  "PspListResponse",
  isPspListResponse,
  (i, c) => {
    const validation = PspListResponsePagoPA.validate(i, c);
    if (validation.isLeft()) {
      // tslint:disable-next-line:no-useless-cast
      return validation as t.Validation<PspListResponse>;
    }
    const value = validation.value;
    return isPspListResponse(value) ? t.success(value) : t.failure(value, c);
  },
  // tslint:disable-next-line:no-useless-cast
  a => a as any
);

/**
 * A refined WalletResponse
 */
export type WalletResponse = ReplaceProp1<WalletResponsePagoPA, "data", Wallet>;

function isWalletResponse(o: any): o is WalletResponse {
  return WalletResponsePagoPA.is(o) && Wallet.is(o.data);
}

export const WalletResponse = new t.Type<
  WalletResponse,
  typeof WalletResponsePagoPA
>(
  "WalletResponse",
  isWalletResponse,
  (i, c) => {
    const validation = WalletResponsePagoPA.validate(i, c);
    if (validation.isLeft()) {
      // tslint:disable-next-line:no-useless-cast
      return validation as t.Validation<WalletResponse>;
    }
    const value = validation.value;
    return isWalletResponse(value) ? t.success(value) : t.failure(value, c);
  },
  // tslint:disable-next-line:no-useless-cast
  a => a as any
);

/**
 * A refined TransactionResponse
 */
export type TransactionResponse = ReplaceProp1<
  TransactionResponsePagoPA,
  "data",
  Transaction
>;

function isTransactionResponse(o: any): o is TransactionResponse {
  return TransactionResponsePagoPA.is(o) && Transaction.is(o.data);
}

export const TransactionResponse = new t.Type<
  TransactionResponse,
  typeof TransactionResponsePagoPA
>(
  "TransactionResponse",
  isTransactionResponse,
  (i, c) => {
    const validation = TransactionResponsePagoPA.validate(i, c);
    if (validation.isLeft()) {
      // tslint:disable-next-line:no-useless-cast
      return validation as t.Validation<TransactionResponse>;
    }
    const value = validation.value;
    return isTransactionResponse(value)
      ? t.success(value)
      : t.failure(value, c);
  },
  // tslint:disable-next-line:no-useless-cast
  a => a as any
);

/**
 * A refined Pay
 */
export type Pay = ReplaceProp1<
  RequiredProp1<PayPagoPA, "idWallet">,
  "tipo",
  "web"
>;

function isPay(o: any): o is Pay {
  return PayPagoPA.is(o) && o.idWallet !== undefined && o.tipo === "web";
}

export const Pay = new t.Type<Pay, typeof PayPagoPA>(
  "Pay",
  isPay,
  (i, c) => {
    const validation = PayPagoPA.validate(i, c);
    if (validation.isLeft()) {
      // tslint:disable-next-line:no-useless-cast
      return validation as t.Validation<Pay>;
    }
    const value = validation.value;
    return isPay(value) ? t.success(value) : t.failure(value, c);
  },
  // tslint:disable-next-line:no-useless-cast
  a => a as any
);

/**
 * A refined PayRequest
 */
export type PayRequest = ReplaceProp1<PayRequestPagoPA, "data", Pay>;

function isPayRequest(o: any): o is PayRequest {
  return PayRequestPagoPA.is(o) && Pay.is(o.data);
}

export const PayRequest = new t.Type<PayRequest, typeof PayRequestPagoPA>(
  "PayRequest",
  isPayRequest,
  (i, c) => {
    const validation = PayRequestPagoPA.validate(i, c);
    if (validation.isLeft()) {
      // tslint:disable-next-line:no-useless-cast
      return validation as t.Validation<PayRequest>;
    }
    const value = validation.value;
    return isPayRequest(value) ? t.success(value) : t.failure(value, c);
  },
  // tslint:disable-next-line:no-useless-cast
  a => a as any
);
