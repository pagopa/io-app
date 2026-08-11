import { OrganizationFiscalCode } from "@io-app/api-types/generated/definitions/communication/OrganizationFiscalCode";
import { PaymentNoticeNumber } from "@io-app/api-types/generated/definitions/communication/PaymentNoticeNumber";

export type NotificationPaymentInfo = {
  creditorTaxId: OrganizationFiscalCode;
  noticeCode: PaymentNoticeNumber;
};
