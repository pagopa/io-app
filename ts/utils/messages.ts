/**
 * Generic utilities for messages
 */

import { CreatedMessageWithContent } from "../../definitions/backend/CreatedMessageWithContent";
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

type MessagePaymentExpirable = {
  kind: "EXPIRABLE";
  noticeNumber: NonNullable<
    CreatedMessageWithContent["content"]["payment_data"]
  >["notice_number"];
  amount: NonNullable<
    CreatedMessageWithContent["content"]["payment_data"]
  >["amount"];
  expireStatus: "VALID" | "EXPIRING" | "EXPIRED";
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
    const remainingMilliseconds = dueDate.getTime() - Date.now();

    const expireStatus =
      remainingMilliseconds > 1000 * 60 * 60 * 24
        ? "VALID"
        : remainingMilliseconds > 0
          ? "EXPIRING"
          : "EXPIRED";

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

export function isUnexpirable(
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
): messagePaymentExpirationInfo is MessagePaymentUnexpirable {
  return messagePaymentExpirationInfo.kind === "UNEXPIRABLE";
}

export function isExpirable(
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
): messagePaymentExpirationInfo is MessagePaymentExpirable {
  return messagePaymentExpirationInfo.kind === "EXPIRABLE";
}

export function isValid(
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
) {
  return (
    isExpirable(messagePaymentExpirationInfo) &&
    messagePaymentExpirationInfo.expireStatus === "VALID"
  );
}

export function isExpiring(
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
) {
  return (
    isExpirable(messagePaymentExpirationInfo) &&
    messagePaymentExpirationInfo.expireStatus === "EXPIRING"
  );
}

export function isExpired(
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
) {
  return (
    isExpirable(messagePaymentExpirationInfo) &&
    messagePaymentExpirationInfo.expireStatus === "EXPIRED"
  );
}
