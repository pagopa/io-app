/**
 * Generic utilities for messages
 */

import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { CreatedMessageWithContent } from "../../definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithContentAndAttachments } from "../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { PrescriptionData } from "../../definitions/backend/PrescriptionData";
import { getExpireStatus } from "./dates";
import { isTextIncludedCaseInsensitive } from "./strings";

export function messageContainsText(
  message: CreatedMessageWithContentAndAttachments,
  searchText: string
) {
  return (
    isTextIncludedCaseInsensitive(message.content.subject, searchText) ||
    isTextIncludedCaseInsensitive(message.content.markdown, searchText)
  );
}

export function messageNeedsDueDateCTA(
  message: CreatedMessageWithContentAndAttachments
): boolean {
  return message.content.due_date !== undefined;
}

export function messageNeedsPaymentCTA(
  message: CreatedMessageWithContentAndAttachments
): boolean {
  return message.content.payment_data !== undefined;
}

export function messageNeedsCTABar(
  message: CreatedMessageWithContentAndAttachments
): boolean {
  return messageNeedsDueDateCTA(message) || messageNeedsPaymentCTA(message);
}

export const hasPrescriptionData = (
  message: CreatedMessageWithContentAndAttachments
): boolean => fromNullable(message.content.prescription_data).isSome();

type MessagePaymentUnexpirable = {
  kind: "UNEXPIRABLE";
  noticeNumber: NonNullable<
    CreatedMessageWithContentAndAttachments["content"]["payment_data"]
  >["notice_number"];
  amount: NonNullable<
    CreatedMessageWithContentAndAttachments["content"]["payment_data"]
  >["amount"];
};
export type ExpireStatus = "VALID" | "EXPIRING" | "EXPIRED";
type MessagePaymentExpirable = {
  kind: "EXPIRABLE";
  noticeNumber: NonNullable<
    CreatedMessageWithContentAndAttachments["content"]["payment_data"]
  >["notice_number"];
  amount: NonNullable<
    CreatedMessageWithContentAndAttachments["content"]["payment_data"]
  >["amount"];
  expireStatus: ExpireStatus;
  dueDate: Date;
};

export type MessagePaymentExpirationInfo =
  | MessagePaymentUnexpirable
  | MessagePaymentExpirable;

export function getMessagePaymentExpirationInfo(
  paymentData: NonNullable<
    CreatedMessageWithContentAndAttachments["content"]["payment_data"]
  >,
  dueDate?: Date
): MessagePaymentExpirationInfo {
  const { notice_number, amount, invalid_after_due_date } = paymentData;

  if (invalid_after_due_date && dueDate !== undefined) {
    const expireStatus = getExpireStatus(dueDate);

    return {
      kind: "EXPIRABLE",
      expireStatus,
      noticeNumber: notice_number,
      amount,
      dueDate
    };
  }

  return { kind: "UNEXPIRABLE", noticeNumber: notice_number, amount };
}

export const paymentExpirationInfo = (message: CreatedMessageWithContent) => {
  const { payment_data, due_date } = message.content;
  return fromNullable(payment_data).map(paymentData =>
    getMessagePaymentExpirationInfo(paymentData, due_date)
  );
};

export const isUnexpirable = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
): messagePaymentExpirationInfo is MessagePaymentExpirable =>
  messagePaymentExpirationInfo.kind === "UNEXPIRABLE";

export const isExpirable = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
): messagePaymentExpirationInfo is MessagePaymentExpirable =>
  messagePaymentExpirationInfo.kind === "EXPIRABLE";

export const isValid = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
) =>
  isExpirable(messagePaymentExpirationInfo) &&
  messagePaymentExpirationInfo.expireStatus === "VALID";

export const isExpiring = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
) =>
  isExpirable(messagePaymentExpirationInfo) &&
  messagePaymentExpirationInfo.expireStatus === "EXPIRING";

export const isExpired = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
) =>
  isExpirable(messagePaymentExpirationInfo) &&
  messagePaymentExpirationInfo.expireStatus === "EXPIRED";

/**
 * given a name, return the relative prescription data value if it corresponds to a field
 * @param message
 * @param name it should be a string nre | iup | prescriber_fiscal_code
 */
export const getPrescriptionDataFromName = (
  prescriptionData: PrescriptionData | undefined,
  name: string
): Option<string> => {
  return fromNullable(prescriptionData).fold(none, pd => {
    switch (name.toLowerCase()) {
      case "nre":
        return some(pd.nre);
      case "iup":
        return fromNullable(pd.iup);
      case "prescriber_fiscal_code":
        return fromNullable(pd.prescriber_fiscal_code);
    }
    return none;
  });
};
