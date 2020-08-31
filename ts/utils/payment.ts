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

import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import { PaymentAmount } from "../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../definitions/backend/PaymentNoticeNumber";
import { DetailEnum } from "../../definitions/backend/PaymentProblemJson";
import {
  getCodiceAvviso,
  PaymentHistory
} from "../store/reducers/payments/history";
import { Psp, Transaction, Wallet } from "../types/pagopa";
import { formatDateAsReminder } from "./dates";
import { getLocalePrimaryWithFallback } from "./locale";
import { maybeInnerProperty } from "./options";
import { formatNumberCentsToAmount } from "./stringBuilder";

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

const hasDescriptionPrefix = (description: string) =>
  description.startsWith("/RFA/") ||
  description.startsWith("/RFB/") ||
  description.startsWith("/RFS/") ||
  description.startsWith("RFA/") ||
  description.startsWith("RFB/") ||
  description.startsWith("RFS/");

/**
 * This function removes the tag from payment description of a PagoPA transaction.
 * @see https://pagopa-codici.readthedocs.io/it/latest/_docs/Capitolo3.html
 */
export const cleanTransactionDescription = (description: string): string => {
  // detect description in pagoPA format - note that we also check for cases
  // without the leading slash since some services don't add it (mistake on
  // their side)
  if (!hasDescriptionPrefix(description)) {
    // not a description in the pagoPA format, return the description unmodified
    return description;
  }

  const descriptionParts = description.split("/TXT/");

  return descriptionParts.length > 1
    ? descriptionParts[descriptionParts.length - 1].trim()
    : "";
};

export const getErrorDescription = (
  error?: keyof typeof DetailEnum
): string | undefined => {
  if (error === undefined) {
    return undefined;
  }
  switch (error) {
    case "PAYMENT_DUPLICATED":
      return I18n.t("wallet.errors.PAYMENT_DUPLICATED");
    case "INVALID_AMOUNT":
      return I18n.t("wallet.errors.INVALID_AMOUNT");
    case "PAYMENT_ONGOING":
      return I18n.t("wallet.errors.PAYMENT_ONGOING");
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

export const getPaymentHistoryDetails = (
  payment: PaymentHistory,
  profile: InitializedProfile
): string => {
  const separator = " / ";
  const profileDetails = `- spid_email: ${fromNullable(
    profile.spid_email as string
  ).getOrElse("spid email: n/a")}${separator}- email: ${fromNullable(
    profile.email as string
  ).getOrElse("email: n/a")}${separator}- cf: ${profile.fiscal_code as string}`;
  const paymentDetails = `- payment start time: ${formatDateAsReminder(
    new Date(payment.started_at)
  )}${separator}- payment data: ${JSON.stringify(payment.data, null, 4)}`;
  const codiceAvviso = `- codice avviso: ${getCodiceAvviso(payment.data)}`;
  const ccp = fromNullable(payment.verified_data)
    .map(pv => `- ccp: ${pv.codiceContestoPagamento}`)
    .getOrElse("ccp: n/a");
  const failureDetails = fromNullable(payment.failure)
    .map(
      pf => `- errore: ${pf} (descrizione errore: ${getErrorDescription(pf)})`
    )
    .getOrElse("errore: n/a");
  return profileDetails.concat(
    separator,
    codiceAvviso,
    separator,
    paymentDetails,
    separator,
    ccp,
    separator,
    failureDetails
  );
};

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
  return fromNullable(maybeFee)
    .map(formatFunc)
    .toNullable();
};

// try to extract codice avviso from transaction description
export const getTransactionCodiceAvviso = (
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
