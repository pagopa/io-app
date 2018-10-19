import { fromEither, Option } from "fp-ts/lib/Option";

import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber,
  PaymentNoticeQrCodeFromString,
  RptId,
  rptIdFromPaymentNoticeQrCode,
  RptIdFromString
} from "italia-ts-commons/lib/pagopa";
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
 * Whether we need to show the PSP selection screen to the user.
 */
export function shouldSelectPspForWallet(
  wallet: Wallet,
  psps: ReadonlyArray<Psp>
): boolean {
  if (psps.length === 1) {
    // FIXME: there can be multiple (equal) PSPs for different languages that
    //        in the UI will be presented as one, so it could happen that
    //        we ask the user to select a PSP when in fact there is only
    //        one option
    // only one PSP, no need to show the PSP selection screen
    return false;
  }

  const walletPsp = wallet.psp;

  if (walletPsp === undefined) {
    // there is no PSP associated to this payment method (wallet), we should
    // show the PSP selection screen
    return true;
  }

  // look for the PSP associated with the wallet in the list of PSPs returned
  // by pagopa
  const walletPspInPsps = psps.find(psp => psp.id === walletPsp.id);

  // if the selected PSP is not available anymore, so show the PSP selection
  // screen
  return walletPspInPsps === undefined;
}
