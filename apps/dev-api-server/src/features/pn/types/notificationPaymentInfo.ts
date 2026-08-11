import { OrganizationFiscalCode } from "../../../../generated/definitions/communication/OrganizationFiscalCode";
import { PaymentNoticeNumber } from "../../../../generated/definitions/communication/PaymentNoticeNumber";

export type NotificationPaymentInfo = {
  creditorTaxId: OrganizationFiscalCode;
  noticeCode: PaymentNoticeNumber;
};
