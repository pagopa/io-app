import { MessageBodyMarkdown } from "../../../../definitions/communication/MessageBodyMarkdown";
import { MessageCategory } from "../../../../definitions/communication/MessageCategory";
import { OrganizationFiscalCode } from "../../../../definitions/communication/OrganizationFiscalCode";
import { PaymentAmount } from "../../../../definitions/communication/PaymentAmount";
import { PaymentNoticeNumber } from "../../../../definitions/communication/PaymentNoticeNumber";
import { TimeToLiveSeconds } from "../../../../definitions/communication/TimeToLiveSeconds";
import { ServiceId } from "../../../../definitions/services/ServiceId";
export type EUCovidCertificate = { authCode: string };

export type PaymentData = {
  amount: PaymentAmount;
  invalidAfterDueDate?: boolean;
  noticeNumber: PaymentNoticeNumber;
  payee: {
    fiscalCode: OrganizationFiscalCode;
  };
};

/** Domain-specific representation of a Message with aggregated data. */
export type UIMessage = {
  category: MessageCategory;
  createdAt: Date;
  hasPrecondition: boolean;
  id: string;
  isArchived: boolean;
  isRead: boolean;
  organizationFiscalCode: string;
  organizationName: string;
  serviceId: ServiceId;
  serviceName: string;
  timeToLive?: TimeToLiveSeconds;
  title: string;
};

/** Domain-specific representation of a Message details */
export type UIMessageDetails = {
  dueDate?: Date;
  euCovidCertificate?: EUCovidCertificate;
  hasRemoteContent: boolean;
  hasThirdPartyData: boolean;
  id: string;
  markdown: MessageBodyMarkdown;
  paymentData?: PaymentData;
  serviceId: ServiceId;
  subject: string;
};
