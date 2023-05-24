import {
  enumType,
  ReplaceProp1,
  replaceProp1 as repP,
  requiredProp1 as reqP,
  tag
} from "@pagopa/ts-commons/lib/types";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import { ImageSourcePropType } from "react-native";
import { Amount as AmountPagoPA } from "../../definitions/pagopa/Amount";
import { CreditCard as CreditCardPagoPA } from "../../definitions/pagopa/CreditCard";
import { EnableableFunctions } from "../../definitions/pagopa/EnableableFunctions";
import { Pay as PayPagoPA } from "../../definitions/pagopa/Pay";
import { PayPalInfo } from "../../definitions/pagopa/PayPalInfo";
import { PayRequest as PayRequestPagoPA } from "../../definitions/pagopa/PayRequest";
import { Psp as PspPagoPA } from "../../definitions/pagopa/Psp";
import { PspListResponseCD as PspListResponsePagoPA } from "../../definitions/pagopa/PspListResponseCD";
import { PspResponse as PspResponsePagoPA } from "../../definitions/pagopa/PspResponse";
import { Session as SessionPagoPA } from "../../definitions/pagopa/Session";
import { SessionResponse as SessionResponsePagoPA } from "../../definitions/pagopa/SessionResponse";
import {
  Transaction as TransactionPagoPA,
  Transaction as TTransactionPagoPA
} from "../../definitions/pagopa/Transaction";
import { TransactionListResponse as TransactionListResponsePagoPA } from "../../definitions/pagopa/TransactionListResponse";
import { TransactionResponse as TransactionResponsePagoPA } from "../../definitions/pagopa/TransactionResponse";
import { Wallet as WalletPagoPA } from "../../definitions/pagopa/Wallet";
import { WalletListResponse as WalletListResponsePagoPA } from "../../definitions/pagopa/WalletListResponse";
import { WalletResponse as WalletResponsePagoPA } from "../../definitions/pagopa/WalletResponse";
import { WalletTypeEnum } from "../../definitions/pagopa/WalletV2";
import { Abi } from "../../definitions/pagopa/walletv2/Abi";
import { BPayInfo as BPayInfoPagoPa } from "../../definitions/pagopa/walletv2/BPayInfo";
import {
  CardInfo,
  TypeEnum as CreditCardTypeEnum
} from "../../definitions/pagopa/walletv2/CardInfo";
import { SatispayInfo as SatispayInfoPagoPa } from "../../definitions/pagopa/walletv2/SatispayInfo";
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
  t.literal("JCB15"),
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
 * - createDate and updateDate are generated from spec as UTCISODateFromString but they have an invalid format (2020-11-03 22:20:29)
 * - info is required
 * - info is CardInfo and not PaymentMethodInfo (empty interface)
 */

// required attributes
const PatchedPaymentMethodInfo = t.union([
  CardInfo,
  SatispayInfoPagoPa,
  BPayInfoPagoPa,
  PayPalInfo
]);
export type PatchedPaymentMethodInfo = t.TypeOf<
  typeof PatchedPaymentMethodInfo
>;
const WalletV2O = t.partial({
  updateDate: t.string,
  createDate: t.string,
  onboardingChannel: t.string,
  favourite: t.boolean
});

// optional attributes
const WalletV2R = t.interface({
  enableableFunctions: t.readonlyArray(
    EnableableFunctions,
    "array of enableableFunctions"
  ),
  info: PatchedPaymentMethodInfo,
  idWallet: t.Integer,
  pagoPA: t.boolean,
  walletType: enumType<WalletTypeEnum>(WalletTypeEnum, "walletType")
});

export const PatchedWalletV2 = t.intersection(
  [WalletV2R, WalletV2O],
  "WalletV2"
);

export type PatchedWalletV2 = t.TypeOf<typeof PatchedWalletV2>;

type WalletV2WithoutInfo = Exclude<PatchedWalletV2, "info" | "walletType">;

/**
 * RawPaymentMethod is a PatchedWalletV2 with "info" changed with one of the specific payment type info.
 * The remote specification they are unable to encode this information, which is why it is reprocessed,
 * in order to have the info value correctly valued in the application domain
 */
export type RawPaymentMethod =
  | RawBancomatPaymentMethod
  | RawCreditCardPaymentMethod
  | RawBPayPaymentMethod
  | RawSatispayPaymentMethod
  | RawPayPalPaymentMethod;

export type RawBancomatPaymentMethod = WalletV2WithoutInfo & {
  kind: "Bancomat";
  info: CardInfo;
};

export type RawCreditCardPaymentMethod = WalletV2WithoutInfo & {
  kind: "CreditCard";
  info: CardInfo;
};

export type RawBPayPaymentMethod = WalletV2WithoutInfo & {
  kind: "BPay";
  info: BPayInfoPagoPa;
};

export type RawSatispayPaymentMethod = WalletV2WithoutInfo & {
  kind: "Satispay";
  info: SatispayInfoPagoPa;
};

export type RawPayPalPaymentMethod = WalletV2WithoutInfo & {
  kind: "PayPal";
  info: PayPalInfo;
};

// payment methods type guards
export const isRawBancomat = (
  pm: RawPaymentMethod | undefined
): pm is RawBancomatPaymentMethod => pm?.kind === "Bancomat";

export const isRawSatispay = (
  pm: RawPaymentMethod | undefined
): pm is RawSatispayPaymentMethod => pm?.kind === "Satispay";

export const isRawPayPal = (
  pm: RawPaymentMethod | undefined
): pm is RawPayPalPaymentMethod => pm?.kind === "PayPal";

export const isRawCreditCard = (
  pm: RawPaymentMethod | undefined
): pm is RawCreditCardPaymentMethod => pm?.kind === "CreditCard";

export const isRawBPay = (
  pm: RawPaymentMethod | undefined
): pm is RawBPayPaymentMethod => pm?.kind === "BPay";

export type PaymentMethodRepresentation = {
  // A textual representation for a payment method
  caption: string;
  // An icon that represent the payment method
  icon: ImageSourcePropType;
};

type WithAbi = {
  abiInfo?: Abi;
};

// In addition to the representation, a bancomat have also the abiInfo
export type BancomatPaymentMethod = RawBancomatPaymentMethod &
  PaymentMethodRepresentation &
  WithAbi;

export type CreditCardPaymentMethod = RawCreditCardPaymentMethod &
  PaymentMethodRepresentation &
  WithAbi;

export type BPayPaymentMethod = RawBPayPaymentMethod &
  PaymentMethodRepresentation &
  WithAbi;
export type SatispayPaymentMethod = RawSatispayPaymentMethod &
  PaymentMethodRepresentation;

export type PayPalPaymentMethod = RawPayPalPaymentMethod &
  PaymentMethodRepresentation;

export type PaymentMethod =
  | BancomatPaymentMethod
  | CreditCardPaymentMethod
  | BPayPaymentMethod
  | SatispayPaymentMethod
  | PayPalPaymentMethod;

// payment methods type guards
export const isBancomat = (
  pm: PaymentMethod | undefined
): pm is BancomatPaymentMethod => pm?.kind === "Bancomat";

export const isSatispay = (
  pm: PaymentMethod | undefined
): pm is SatispayPaymentMethod => pm?.kind === "Satispay";

export const isPayPal = (
  pm: PaymentMethod | undefined
): pm is PayPalPaymentMethod => pm?.kind === "PayPal";

export const isCreditCard = (
  pm: PaymentMethod | undefined
): pm is CreditCardPaymentMethod =>
  pm === undefined
    ? false
    : pm.kind === "CreditCard" && pm.info.type !== CreditCardTypeEnum.PRV;

export const isBPay = (
  pm: PaymentMethod | undefined
): pm is BPayPaymentMethod => (pm === undefined ? false : pm.kind === "BPay");

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

export type Wallet = t.TypeOf<typeof Wallet> & {
  paymentMethod?: RawPaymentMethod;
};

/**
 * A Wallet that has not being saved yet
 */
export type NullableWallet = ReplaceProp1<Wallet, "idWallet", undefined>;

/**
 * A refined Transaction
 */
export type Transaction = TTransactionPagoPA;
export const Transaction = TransactionPagoPA;

export const isCompletedTransaction = (tx: Transaction) => tx.idStatus === 3;

const successTransactionIdStatusCases: ReadonlyArray<number> = [8, 9];

const successTransactionAccountingStatusCases: ReadonlyArray<number> = [1, 5];

/**
 * to determine if a transaction is successfully completed we have to consider 2 cases
 * 1. payed /w CREDIT CARD: accountingStatus is not undefined AND accountingStatus === 1 || accountingStatus === 5 means the transaction has been
 * confirmed and the payment has been successfully completed
 * 2.payed /w other methods: accountingStatus is undefined AND id_status = 8 (Confermato mod1) or id_status = 9 (Confermato mod2)
 * ref: https://www.pivotaltracker.com/story/show/173850410
 */
export const isSuccessTransaction = (tx?: Transaction): boolean =>
  pipe(
    tx,
    O.fromNullable,
    O.map(tsx =>
      pipe(
        tsx.accountingStatus,
        O.fromNullable,
        O.fold(
          () =>
            successTransactionIdStatusCases.some(ids => ids === tsx.idStatus),
          accountingStatus =>
            successTransactionAccountingStatusCases.includes(accountingStatus)
        )
      )
    ),
    O.getOrElse(() => false)
  );

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

// required attributes
const PatchedWalletV2ResponseR = t.interface({});

// optional attributes
const PatchedWalletV2ResponseO = t.partial({
  data: PatchedWalletV2
});

export const PatchedWalletV2Response = t.intersection(
  [PatchedWalletV2ResponseR, PatchedWalletV2ResponseO],
  "PatchedWalletV2Response"
);

export type PatchedWalletV2Response = t.TypeOf<typeof PatchedWalletV2Response>;

/**
 * The patched version of the DeleteWalletResponse is needed because remainingWallets is not of type
 * PatchedWalletV2 but instead it's type is WalletV2.
 */
export const PatchedDeleteWalletResponse = t.interface({
  data: t.interface({
    deletedWallets: t.number,
    notDeletedWallets: t.number,
    remainingWallets: t.readonlyArray(PatchedWalletV2)
  })
});

export type PatchedDeleteWalletResponse = t.TypeOf<
  typeof PatchedDeleteWalletResponse
>;
