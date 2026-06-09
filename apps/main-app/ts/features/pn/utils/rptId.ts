import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";

export const getRptIdStringFromPayment = (
  payment: NotificationPaymentInfo
): string => `${payment.creditorTaxId}${payment.noticeCode}`;
