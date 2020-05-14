/**
 * Generic utilities for messages
 */

import { fromNullable } from "fp-ts/lib/Option";
import { CreatedMessageWithContent } from "../../definitions/backend/CreatedMessageWithContent";
import { getExpireStatus } from "./dates";
import { isTextIncludedCaseInsensitive } from "./strings";

export function messageContainsText(
  message: CreatedMessageWithContent,
  searchText: string
) {
  return (
    isTextIncludedCaseInsensitive(message.content.subject, searchText) ||
    isTextIncludedCaseInsensitive(message.content.markdown, searchText)
  );
}

export function messageNeedsDueDateCTA(
  message: CreatedMessageWithContent
): boolean {
  return message.content.due_date !== undefined;
}

export function messageNeedsPaymentCTA(
  message: CreatedMessageWithContent
): boolean {
  return message.content.payment_data !== undefined;
}

export function messageNeedsCTABar(
  message: CreatedMessageWithContent
): boolean {
  return messageNeedsDueDateCTA(message) || messageNeedsPaymentCTA(message);
}

type MessagePaymentUnexpirable = {
  kind: "UNEXPIRABLE";
  noticeNumber: NonNullable<
    CreatedMessageWithContent["content"]["payment_data"]
  >["notice_number"];
  amount: NonNullable<
    CreatedMessageWithContent["content"]["payment_data"]
  >["amount"];
};
export type ExpireStatus = "VALID" | "EXPIRING" | "EXPIRED";
type MessagePaymentExpirable = {
  kind: "EXPIRABLE";
  noticeNumber: NonNullable<
    CreatedMessageWithContent["content"]["payment_data"]
  >["notice_number"];
  amount: NonNullable<
    CreatedMessageWithContent["content"]["payment_data"]
  >["amount"];
  expireStatus: ExpireStatus;
  dueDate: Date;
};

export type MessagePaymentExpirationInfo =
  | MessagePaymentUnexpirable
  | MessagePaymentExpirable;

export function getMessagePaymentExpirationInfo(
  paymentData: NonNullable<
    CreatedMessageWithContent["content"]["payment_data"]
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
