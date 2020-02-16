import { fromEither, Option } from "fp-ts/lib/Option";
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
import { Psp, Wallet } from "../types/pagopa";

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
  const maxLength = 60;
  if (
    !description.startsWith("/RFA/") &&
    !description.startsWith("/RFB/") &&
    !description.startsWith("RFA/") &&
    !description.startsWith("RFB/")
  ) {
    // not a description in the pagoPA format, return the description unmodified
    return `${description.substr(0, maxLength)}${
      description.length > maxLength ? "..." : ""
    }`;
  }

  const descriptionParts = description.split("/TXT/");

  const splitted =
    descriptionParts.length > 1
      ? descriptionParts[descriptionParts.length - 1].trim()
      : "";
  return `${splitted.substr(0, maxLength)}${
    description.length > maxLength ? "..." : ""
  }`;
};
