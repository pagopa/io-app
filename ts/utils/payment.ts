import { fromEither, fromNullable, Option } from "fp-ts/lib/Option";
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
import { PaymentHistory } from "../store/reducers/payments/history";
import { Psp, Wallet } from "../types/pagopa";
import { formatDateAsReminder } from "./dates";

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
  locale: string = I18n.locale.slice(0, 2)
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
 * This function removes the tag from payment description of a PagoPA transaction.
 * @see https://pagopa-codici.readthedocs.io/it/latest/_docs/Capitolo3.html
 */
export const cleanTransactionDescription = (description: string): string => {
  // detect description in pagoPA format - note that we also check for cases
  // without the leading slash since some services don't add it (mistake on
  // their side)
  if (
    !description.startsWith("/RFA/") &&
    !description.startsWith("/RFB/") &&
    !description.startsWith("RFA/") &&
    !description.startsWith("RFB/")
  ) {
    // not a description in the pagoPA format, return the description unmodified
    return description;
  }

  const descriptionParts = description.split("/TXT/");

  return descriptionParts.length > 1
    ? descriptionParts[descriptionParts.length - 1].trim()
    : "";
};

export const getPaymentHistoryDetails = (
  payment: PaymentHistory,
  profile: InitializedProfile
): string => {
  const separator = " / ";
  const profileDetails = `- spid_email: ${fromNullable(
    profile.spid_email as string
  ).getOrElse("n/a")}${separator}- email: ${fromNullable(
    profile.email as string
  ).getOrElse("n/a")}${separator}- cf: ${profile.fiscal_code as string}`;
  const paymentDetails = `- payment start time: ${formatDateAsReminder(
    new Date(payment.started_at)
  )}${separator}- payment data: ${JSON.stringify(payment.data, null, 4)}`;
  const ccp = fromNullable(payment.verified_data)
    .map(pv => `- ccp: ${pv.codiceContestoPagamento}`)
    .getOrElse("");
  const failureDetails = fromNullable(payment.failure)
    .map(pf => `- errore: ${pf}`)
    .getOrElse("");
  return profileDetails.concat(
    separator,
    paymentDetails,
    paymentDetails,
    separator,
    ccp,
    separator,
    failureDetails
  );
};
