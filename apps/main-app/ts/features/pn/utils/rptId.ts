import { NotificationPaymentInfo } from "@io-app/api-types/generated/definitions/pn/NotificationPaymentInfo";

export const getRptIdStringFromPayment = (
  payment: NotificationPaymentInfo
): string => `${payment.creditorTaxId}${payment.noticeCode}`;
