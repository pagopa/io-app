import { NotificationPaymentInfo } from "./notificationPaymentInfo";

export type NotificationRecipient = {
  denomination: string;
  payment: NotificationPaymentInfo;
  recipientType: string;
  taxId: string;
};
