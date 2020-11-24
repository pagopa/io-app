import { fromNullable } from "fp-ts/lib/Option";
import * as t from "io-ts";
import {
  enumType,
  ReplaceProp1,
  replaceProp1 as repP,
  requiredProp1 as reqP,
  tag
} from "italia-ts-commons/lib/types";
import { ImageSourcePropType } from "react-native";
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
import { Abi } from "../../definitions/pagopa/walletv2/Abi";
import { BPayInfo as BPayInfoPagoPa } from "../../definitions/pagopa/walletv2/BPayInfo";
import { CardInfo } from "../../definitions/pagopa/walletv2/CardInfo";
import { SatispayInfo as SatispayInfoPagoPa } from "../../definitions/pagopa/walletv2/SatispayInfo";
import { WalletTypeEnum } from "../../definitions/pagopa/walletv2/WalletV2";
import { IndexedById } from "../store/helpers/indexer";
import {
  CreditCardCVC,
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan
} from "../utils/input";
import {
  getImageFromPaymentMethod,
  getTitleFromBancomat,
  getTitleFromPaymentMethod
} from "../utils/paymentMethod";

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
 * - createDate and updateDate are generated from spec as UTCISODateFromString but they have an invalid format (2020-11-03 22:20:29)
 * - info is required
 * - info is CardInfo and not PaymentMethodInfo (empty interface)
 * - enableableFunctions is build as an array of strings instead of array of enum (io-utils code generation limit)
 */

export enum EnableableFunctionsTypeEnum {
  "pagoPA" = "pagoPA",
  "BPD" = "BPD",
  "FA" = "FA"
}

// required attributes
const PatchedPaymentMethodInfo = t.union([
  CardInfo,
  SatispayInfoPagoPa,
  BPayInfoPagoPa
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
    enumType<EnableableFunctionsTypeEnum>(
      EnableableFunctionsTypeEnum,
      "enableableFunctions"
    ),
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
  | RawSatispayPaymentMethod;

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

// payment methods type guards
export const isRawBancomat = (
  pm: RawPaymentMethod | undefined
): pm is RawBancomatPaymentMethod =>
  pm === undefined ? false : pm.kind === "Bancomat";

export const isRawSatispay = (
  pm: RawPaymentMethod | undefined
): pm is RawSatispayPaymentMethod =>
  pm === undefined ? false : pm.kind === "Satispay";

export const isRawCreditCard = (
  pm: RawPaymentMethod | undefined
): pm is RawCreditCardPaymentMethod =>
  pm === undefined ? false : pm.kind === "CreditCard";

export const isRawBPay = (
  pm: RawPaymentMethod | undefined
): pm is RawBPayPaymentMethod =>
  pm === undefined ? false : pm.kind === "BPay";

export type PaymentMethodRepresentation = {
  // A textual representation for a payment method
  caption: string;
  // An icon that represent the payment method
  icon: ImageSourcePropType;
};

// In addition to the representation, a bancomat have also the abiInfo
export type BancomatPaymentMethod = RawBancomatPaymentMethod &
  PaymentMethodRepresentation & {
    abiInfo?: Abi;
  };

export type CreditCardPaymentMethod = RawCreditCardPaymentMethod &
  PaymentMethodRepresentation;

export type BPayPaymentMethod = RawBPayPaymentMethod &
  PaymentMethodRepresentation;
export type SatispayPaymentMethod = RawSatispayPaymentMethod &
  PaymentMethodRepresentation;

export type PaymentMethod =
  | BancomatPaymentMethod
  | CreditCardPaymentMethod
  | BPayPaymentMethod
  | SatispayPaymentMethod;

// payment methods type guards
export const isBancomat = (
  pm: PaymentMethod | undefined
): pm is BancomatPaymentMethod =>
  pm === undefined ? false : pm.kind === "Bancomat";

export const isSatispay = (
  pm: PaymentMethod | undefined
): pm is SatispayPaymentMethod =>
  pm === undefined ? false : pm.kind === "Satispay";

export const isCreditCard = (
  pm: PaymentMethod | undefined
): pm is CreditCardPaymentMethod =>
  pm === undefined ? false : pm.kind === "CreditCard";

export const isBPay = (
  pm: PaymentMethod | undefined
): pm is BPayPaymentMethod => (pm === undefined ? false : pm.kind === "BPay");

export const enhanceBancomat = (
  bancomat: RawBancomatPaymentMethod,
  abiList: IndexedById<Abi>
): BancomatPaymentMethod => ({
  ...bancomat,
  abiInfo: bancomat.info.issuerAbiCode
    ? abiList[bancomat.info.issuerAbiCode]
    : undefined,
  caption: getTitleFromBancomat(bancomat, abiList),
  icon: getImageFromPaymentMethod(bancomat)
});

export const enhancePaymentMethod = (
  pm: RawPaymentMethod,
  abiList: IndexedById<Abi>
): PaymentMethod => {
  switch (pm.kind) {
    // bancomat need a special handling, we need to include the abi
    case "Bancomat":
      return enhanceBancomat(pm, abiList);
    case "CreditCard":
    case "BPay":
    case "Satispay":
      return {
        ...pm,
        caption: getTitleFromPaymentMethod(pm, abiList),
        icon: getImageFromPaymentMethod(pm)
      };
  }
};

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
