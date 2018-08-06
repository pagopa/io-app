import { fromEither, Option, fromNullable } from "fp-ts/lib/Option";

import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber,
  RptId,
  RptIdFromString
} from "italia-ts-commons/lib/pagopa";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import { ITuple2, Tuple2 } from "italia-ts-commons/lib/tuples";

import I18n from "../i18n";

import { PaymentAmount } from "../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../definitions/backend/PaymentNoticeNumber";
import { MessageWithContentPO } from "../types/MessageWithContentPO";
import { ServicesByIdState } from "../store/reducers/entities/services/servicesById";

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
  return fromEither(AmountInEuroCentsFromNumber.decode(paymentAmount / 100));
}

export const getRptIdAndAmountFromMessage = (
  servicesById: ServicesByIdState
) => (
  message: MessageWithContentPO
): Option<ITuple2<RptId, AmountInEuroCents>> => {
  return fromNullable(message.payment_data).map(paymentData =>
    getRptIdFromNoticeNumber(paymentData.notice_number).chain(rptId =>
      getAmountFromPaymentAmount(paymentData.amount).map(amount =>
        Tuple2(rptId, amount)
      )
    )
  );
};
