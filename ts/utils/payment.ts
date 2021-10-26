import { fromEither, fromNullable, none, Option, some } from "fp-ts/lib/Option";
import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber,
  PaymentNoticeQrCodeFromString,
  RptId,
  rptIdFromPaymentNoticeQrCode,
  RptIdFromString
} from "italia-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import { ITuple2, Tuple2 } from "italia-ts-commons/lib/tuples";

import I18n from "../i18n";

import { PaymentAmount } from "../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../definitions/backend/PaymentNoticeNumber";
import { PaymentHistory } from "../store/reducers/payments/history";
import {
  BancomatPaymentMethod,
  CreditCardPaymentMethod,
  PrivativePaymentMethod,
  Psp,
  Transaction,
  Wallet
} from "../types/pagopa";
import {
  OutcomeCode,
  OutcomeCodes,
  OutcomeCodesKey
} from "../types/outcomeCode";
import {
  Detail_v2Enum,
  DetailEnum
} from "../../definitions/backend/PaymentProblemJson";
import { getTranslatedShortNumericMonthYear } from "./dates";
import { getFullLocale, getLocalePrimaryWithFallback } from "./locale";
import { maybeInnerProperty } from "./options";
import { formatNumberCentsToAmount } from "./stringBuilder";
import { maybeNotNullyString } from "./strings";

export const paymentInstabugTag = "payment-support";

/**
 * A method to convert an payment amount in a proper formatted string
 * @param amount In euro-cents
 */
export function formatPaymentAmount(amount: number): string {
  // We need to divide by 100 to get euro from euro-cents
  return I18n.toNumber(amount / 100, { precision: 2 });
}

/**
 * Converts a NoticeNumber coming from a Message to an RptId needed by PagoPA
 */
export function getRptIdFromNoticeNumber(
  organizationFiscalCode: OrganizationFiscalCode,
  noticeNumber: PaymentNoticeNumber
): Option<RptId> {
  return fromEither(
    RptIdFromString.decode(`${organizationFiscalCode}${noticeNumber}`)
  );
}

/**
 * Converts a PaymentAmount coming from a Message to an AmountInEuroCents
 * needed by PagoPA
 *
 * FIXME: https://www.pivotaltracker.com/story/show/159526631
 */
export function getAmountFromPaymentAmount(
  paymentAmount: PaymentAmount
): Option<AmountInEuroCents> {
  // PaymentAmount is in EURO cents but AmountInEuroCentsFromNumber expects
  // the amount to be in EUROs, thus we must divide by 100
  return fromEither(AmountInEuroCentsFromNumber.decode(paymentAmount / 100.0));
}

export function decodePagoPaQrCode(
  data: string
): Option<ITuple2<RptId, AmountInEuroCents>> {
  const paymentNoticeOrError = PaymentNoticeQrCodeFromString.decode(data);
  return fromEither(
    paymentNoticeOrError.chain(paymentNotice =>
      rptIdFromPaymentNoticeQrCode(paymentNotice).map(rptId =>
        Tuple2(rptId, paymentNotice.amount)
      )
    )
  );
}

/**
 * The PaymentManager returns a PSP entry for each supported language, so
 * we need to skip PSPs that have the language different from the current
 * locale.
 */
export const pspsForLocale = (
  psps: ReadonlyArray<Psp>,
  locale: string = getLocalePrimaryWithFallback()
) => psps.filter(_ => (_.lingua ? _.lingua.toLowerCase() === locale : true));

/**
 * Whether we need to show the PSP selection screen to the user.
 */
export function walletHasFavoriteAvailablePsp(
  wallet: Wallet,
  psps: ReadonlyArray<Psp>
): boolean {
  // see whether there's a PSP that has already been used with this wallet
  const maybeWalletPsp = wallet.psp;

  if (maybeWalletPsp === undefined) {
    // there is no PSP associated to this payment method (wallet), we cannot
    // automatically select a PSP
    return false;
  }

  // see whether the PSP associated with this wallet can be used for this
  // payment
  const walletPspInPsps = psps.find(psp => psp.id === maybeWalletPsp.id);

  // if the wallet PSP is one of the available PSPs, we can automatically
  // select it
  return walletPspInPsps !== undefined;
}

/**
 * This tags are defined in PagoPA specs for transaction description.
 * @see https://pagopa-codici.readthedocs.io/it/latest/_docs/Capitolo3.html
 */
const prefixes: ReadonlyArray<string> = ["RFA", "RFB", "RFS"];

const hasDescriptionPrefix = (description: string) =>
  prefixes.some(
    p => description.startsWith(`${p}/`) || description.startsWith(`/${p}/`)
  );

/**
 * This function removes the tag from payment description of a PagoPA transaction.
 */
export const cleanTransactionDescription = (description: string): string => {
  const descriptionParts = description.split("TXT/");

  return descriptionParts.length > 1
    ? descriptionParts[descriptionParts.length - 1].trim()
    : getTransactionIUV(description) // try to extract codice avviso from description
        .chain(maybeNotNullyString)
        .map(ca => `${I18n.t("payment.IUV")} ${ca}`)
        .getOrElse(description);
};

export const getErrorDescription = (
  error?: keyof typeof DetailEnum
): string | undefined => {
  if (error === undefined) {
    return undefined;
  }
  switch (error) {
    case "PAYMENT_DUPLICATED":
      return I18n.t("wallet.errors.DUPLICATED");
    case "INVALID_AMOUNT":
      return I18n.t("wallet.errors.INVALID_AMOUNT");
    case "PAYMENT_ONGOING":
      return I18n.t("wallet.errors.ONGOING");
    case "PAYMENT_EXPIRED":
      return I18n.t("wallet.errors.PAYMENT_EXPIRED");
    case "PAYMENT_UNAVAILABLE":
      return I18n.t("wallet.errors.PAYMENT_UNAVAILABLE");
    case "PAYMENT_UNKNOWN":
      return I18n.t("wallet.errors.PAYMENT_UNKNOWN");
    case "DOMAIN_UNKNOWN":
      return I18n.t("wallet.errors.DOMAIN_UNKNOWN");
    default:
      return undefined;
  }
};

type MainErrorType = "TECHNICAL" | "DATA" | "EC";

export type ErrorTypes =
  | MainErrorType
  | "REVOKED"
  | "EXPIRED"
  | "ONGOING"
  | "DUPLICATED"
  | "UNCOVERED";

export type DetailV2Keys = keyof typeof Detail_v2Enum;

const technicalSet: Set<DetailV2Keys> = new Set<DetailV2Keys>([
  "PPT_PSP_SCONOSCIUTO",
  "PPT_PSP_DISABILITATO",
  "PPT_INTERMEDIARIO_PSP_SCONOSCIUTO",
  "PPT_INTERMEDIARIO_PSP_DISABILITATO",
  "PPT_CANALE_SCONOSCIUTO",
  "PPT_CANALE_DISABILITATO",
  "PPT_AUTENTICAZIONE",
  "PPT_AUTORIZZAZIONE",
  "PPT_DOMINIO_DISABILITATO",
  "PPT_INTERMEDIARIO_PA_DISABILITATO",
  "PPT_STAZIONE_INT_PA_DISABILITATA",
  "PPT_CODIFICA_PSP_SCONOSCIUTA",
  "PPT_SEMANTICA",
  "PPT_SYSTEM_ERROR",
  "PAA_SEMANTICA"
]);

const dataSet = new Set<DetailV2Keys>([
  "PPT_SINTASSI_EXTRAXSD",
  "PPT_SINTASSI_XSD",
  "PPT_DOMINIO_SCONOSCIUTO",
  "PPT_STAZIONE_INT_PA_SCONOSCIUTA",
  "PAA_PAGAMENTO_SCONOSCIUTO"
]);

const ecSet = new Set<DetailV2Keys>([
  "PPT_STAZIONE_INT_PA_IRRAGGIUNGIBILE",
  "PPT_STAZIONE_INT_PA_TIMEOUT",
  "PPT_STAZIONE_INT_PA_ERRORE_RESPONSE",
  "PPT_IBAN_NON_CENSITO",
  "PAA_SINTASSI_EXTRAXSD",
  "PAA_SINTASSI_XSD",
  "PAA_ID_DOMINIO_ERRATO",
  "PAA_ID_INTERMEDIARIO_ERRATO",
  "PAA_STAZIONE_INT_ERRATA",
  "PAA_ATTIVA_RPT_IMPORTO_NON_VALIDO"
]);

const v2ErrorMacrosMap = new Map<MainErrorType, Set<DetailV2Keys>>([
  ["TECHNICAL", technicalSet],
  ["DATA", dataSet],
  ["EC", ecSet]
]);

/**
 * This function is used to convert the raw error code to the main error type.
 * Main error types is represented by the union type ErrorTypes.
 * @param error
 */
export const getV2ErrorMainType = (
  error?: DetailV2Keys
): ErrorTypes | undefined => {
  if (error === undefined) {
    return undefined;
  }

  const errorInMap = [...v2ErrorMacrosMap.keys()].find(k =>
    fromNullable(v2ErrorMacrosMap.get(k)).fold(false, s => s.has(error))
  );

  if (errorInMap !== undefined) {
    return errorInMap;
  }

  switch (error) {
    case "PAA_PAGAMENTO_IN_CORSO":
      return "ONGOING";
    case "PAA_PAGAMENTO_ANNULLATO":
      return "REVOKED";
    case "PAA_PAGAMENTO_SCADUTO":
      return "EXPIRED";
    case "PAA_PAGAMENTO_DUPLICATO":
      return "DUPLICATED";
    default:
      return "UNCOVERED";
  }
};

export const getErrorDescriptionV2 = (
  error?: DetailV2Keys
): string | undefined => {
  if (error === undefined) {
    return undefined;
  }

  const errorMacro = getV2ErrorMainType(error);

  return I18n.t(`wallet.errors.${errorMacro}`, {
    defaultValue: I18n.t("wallet.errors.GENERIC_ERROR")
  });
};

export const getPaymentHistoryDetails = (payment: PaymentHistory): string =>
  JSON.stringify({ payment });

// return the transaction fee it transaction is defined and its fee property too
export const getTransactionFee = (
  transaction?: Transaction,
  formatFunc: (fee: number) => string = (f: number) =>
    formatNumberCentsToAmount(f, true)
): string | null => {
  const maybeFee = maybeInnerProperty<Transaction, "fee", number | undefined>(
    transaction,
    "fee",
    m => (m ? m.amount : undefined)
  ).getOrElse(undefined);
  return fromNullable(maybeFee).map(formatFunc).toNullable();
};

// try to extract IUV from transaction description
// see https://docs.italia.it/pagopa/pagopa_docs/pagopa-codici-docs/it/v1.4.0/_docs/Capitolo3.html
export const getTransactionIUV = (
  transactionDescription: string
): Option<string> => {
  const description = transactionDescription.trim();
  if (!hasDescriptionPrefix(description)) {
    return none;
  }
  const splitted = description.split("/").filter(i => i.trim().length > 0);
  return splitted.length > 1 ? some(splitted[1]) : none;
};

/**
 * Order the list of PSPs by fixed cost amount: from lower to higher
 */
export const orderPspByAmount = (pspList: ReadonlyArray<Psp>) =>
  pspList.concat().sort((pspA: Psp, pspB: Psp) => {
    if (pspA.fixedCost.amount < pspB.fixedCost.amount) {
      return -1;
    } else if (pspA.fixedCost.amount > pspB.fixedCost.amount) {
      return 1;
    }
    return 0;
  });

export const getIuv = (data: RptId): string => {
  switch (data.paymentNoticeNumber.auxDigit) {
    case "0":
    case "3":
      return data.paymentNoticeNumber.iuv13;
    case "1":
      return data.paymentNoticeNumber.iuv17;
    case "2":
      return data.paymentNoticeNumber.iuv15;
  }
};

// return the notice code from the given rptId
// see https://docs.italia.it/pagopa/pagopa_docs/pagopa-codici-docs/it/v1.4.0/_docs/Capitolo2.html#valore-0-del-componente-aux-digit
export const getCodiceAvviso = (rptId: RptId) => {
  const pnn = rptId.paymentNoticeNumber;
  switch (pnn.auxDigit) {
    // 0<application code (2n)><IUV base (13n)><IUV check digit (2n)>
    case "0":
      return `${pnn.auxDigit}${pnn.applicationCode}${getIuv(rptId)}${
        pnn.checkDigit
      }`;
    // 1<IUV base (17n)>
    case "1":
      return `${pnn.auxDigit}${getIuv(rptId)}`;
    // 2<IUV base (15n)><IUV check digit (2n)>
    case "2":
      return `${pnn.auxDigit}${getIuv(rptId)}${pnn.checkDigit}`;
    case "3":
      // 3<codice segregazione (2n)><IUVbase (13n)><IUV check digit (2n)>
      return `${pnn.auxDigit}${pnn.segregationCode}${getIuv(rptId)}${
        pnn.checkDigit
      }`;
  }
};

// from a give generic code and outcome codes say true if that code represents a success
export const isPaymentOutcomeCodeSuccessfully = (
  code: string,
  outcomeCodes: OutcomeCodes
): boolean => {
  const maybeValidCode = OutcomeCodesKey.decode(code);
  return maybeValidCode.fold(
    _ => false,
    c => outcomeCodes[c].status === "success"
  );
};

export const getPaymentOutcomeCodeDescription = (
  outcomeCode: string,
  outcomeCodes: OutcomeCodes
): Option<string> => {
  const maybeOutcomeCodeKey = OutcomeCodesKey.decode(outcomeCode);
  if (maybeOutcomeCodeKey.isRight()) {
    return fromNullable<OutcomeCode>(outcomeCodes[maybeOutcomeCodeKey.value])
      .mapNullable(oc => oc.description)
      .map(description => description[getFullLocale()]);
  }
  return none;
};

export const getPickPaymentMethodDescription = (
  paymentMethod:
    | CreditCardPaymentMethod
    | PrivativePaymentMethod
    | BancomatPaymentMethod,
  defaultHolder: string = ""
) => {
  const translatedExpireDate = getTranslatedShortNumericMonthYear(
    paymentMethod.info.expireYear,
    paymentMethod.info.expireMonth
  );
  return translatedExpireDate
    ? I18n.t("wallet.payWith.pickPaymentMethod.description", {
        firstElement: translatedExpireDate,
        secondElement: paymentMethod.info.holder ?? defaultHolder
      })
    : fromNullable(paymentMethod.info.holder).getOrElse(defaultHolder);
};
