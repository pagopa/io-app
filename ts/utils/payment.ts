import { fromEither, Option } from "fp-ts/lib/Option";

import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber,
  RptId
} from "italia-ts-commons/lib/pagopa";

import I18n from "../i18n";

import { PaymentAmount } from "../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../definitions/backend/PaymentNoticeNumber";
import { RptIdFromString } from "../../definitions/backend/RptIdFromString";

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
  noticeNumber: PaymentNoticeNumber
): Option<RptId> {
  return fromEither(RptIdFromString.decode(noticeNumber));
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
  return fromEither(AmountInEuroCentsFromNumber.decode(paymentAmount));
}
