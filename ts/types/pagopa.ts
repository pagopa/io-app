import { fromNullable } from "fp-ts/lib/Option";
import * as t from "io-ts";
import {
  enumType,
  ReplaceProp1,
  replaceProp1 as repP,
  requiredProp1 as reqP,
  tag
} from "italia-ts-commons/lib/types";
import { DateFromString } from "italia-ts-commons/lib/dates";
import { Amount as AmountPagoPA } from "../../definitions/pagopa/Amount";
import { WalletTypeEnum } from "../../definitions/pagopa/walletv2/WalletV2";
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
import { CardInfo } from "../../definitions/pagopa/walletv2/CardInfo";

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

/** A refined WalletV2
 * reasons:
 * - createDate and updateDate are generated from spec as UTCISODateFromString instead of DateFromString
 * - info is required
 * - info is CardInfo and not PaymentMethodInfo (empty interface)
 * - enableableFunctions is build as an array of strings instead of array of enum (code generation limit)
 */

export enum EnableableFunctionsTypeEnum {
  "pagoPA" = "pagoPA",

  "BPD" = "BPD",

  "FA" = "FA"
}

// required attributes

const WalletV2O = t.partial({
  updateDate: t.string,
  createDate: DateFromString,
  onboardingChannel: t.string,
  favourite: t.boolean
});

// optional attributes
const WalletV2R = t.interface({
  enableableFunctions: t.readonlyArray(
    enumType<EnableableFunctionsTypeEnum>(
      EnableableFunctionsTypeEnum,
      "enableableFunctions"
    ),
    "array of string"
  ),
  info: CardInfo,
  idWallet: t.Integer,
  pagoPA: t.boolean,
  walletType: enumType<WalletTypeEnum>(WalletTypeEnum, "walletType")
});

export const PatchedWalletV2 = t.intersection(
  [WalletV2R, WalletV2O],
  "WalletV2"
);

export type PatchedWalletV2 = t.TypeOf<typeof PatchedWalletV2>;

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
// add v2 optional field. It may contain a PatchedWalletV2 object
const WalletV1V2 = t.intersection([Wallet, t.partial({ v2: PatchedWalletV2 })]);
export type Wallet = t.TypeOf<typeof WalletV1V2>;

/**
 * A Wallet that has not being saved yet
 */
export type NullableWallet = ReplaceProp1<Wallet, "idWallet", undefined>;

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

const idStatusSuccessTransaction: ReadonlyArray<number> = [8, 9];
/**
 * to determine if a transaction is successfully completed we have to consider 2 cases
 * 1. payed /w CREDIT CARD: accountingStatus is not undefined AND accountingStatus === 1 means the transaction has been
 * confirmed and the payment has been successfully completed
 * 2.payed /w other methods: accountingStatus is undefined AND id_status = 8 (Confermato mod1) or id_status = 9 (Confermato mod2)
 * ref: https://www.pivotaltracker.com/story/show/173850410
 */
export const isSuccessTransaction = (tx?: Transaction): boolean =>
  fromNullable(tx)
    .map(tsx =>
      fromNullable(tsx.accountingStatus).foldL(
        () => idStatusSuccessTransaction.some(ids => ids === tsx.idStatus),
        as => as === 1
      )
    )
    .getOrElse(false);

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

const WalletV2ListResponseR = t.interface({});

// optional attributes
const WalletV2ListResponseO = t.partial({
  data: t.readonlyArray(PatchedWalletV2, "array of PatchedWalletV2")
});

export const PatchedWalletV2ListResponse = t.intersection(
  [WalletV2ListResponseR, WalletV2ListResponseO],
  "WalletV2ListResponse"
);

export type PatchedWalletV2ListResponse = t.TypeOf<
  typeof PatchedWalletV2ListResponse
>;
