import { fromEither, fromNullable, Option } from "fp-ts/lib/Option";

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
  return fromEither(AmountInEuroCentsFromNumber.decode(paymentAmount / 100.0));
}

/**
 * Returns the RptId and the AmountInEuroCents from a Message by extracting and
 * parsing the PaymentData from the Message and looking up the Organization
 * FiscalCode from the Message sender.
 */
export function getRptIdAndAmountFromMessage(
  servicesById: ServicesByIdState,
  message: MessageWithContentPO
): Option<ITuple2<RptId, AmountInEuroCents>> {
  return fromNullable(servicesById[message.sender_service_id]).chain(
    service => {
      return fromNullable(message.content.payment_data).chain(paymentData => {
        return getRptIdFromNoticeNumber(
          service.organization_fiscal_code,
          paymentData.notice_number
        ).chain(rptId => {
          return getAmountFromPaymentAmount(paymentData.amount).map(amount => {
            return Tuple2(rptId, amount);
          });
        });
      });
    }
  );
}
