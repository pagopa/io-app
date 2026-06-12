import { MessageBodyMarkdown } from "../../../../definitions/communication/MessageBodyMarkdown";
import { OrganizationFiscalCode } from "../../../../definitions/communication/OrganizationFiscalCode";
import { PaymentAmount } from "../../../../definitions/communication/PaymentAmount";
import { PaymentNoticeNumber } from "../../../../definitions/communication/PaymentNoticeNumber";
import { ServiceId } from "../../../../definitions/services/ServiceId";
import { TimeToLiveSeconds } from "../../../../definitions/communication/TimeToLiveSeconds";
import { MessageCategory } from "../../../../definitions/communication/MessageCategory";
/** Domain-specific representation of a Message with aggregated data. */
export type UIMessage = {
  id: string;
  category: MessageCategory;
  createdAt: Date;
  isRead: boolean;
  isArchived: boolean;
  serviceId: ServiceId;
  serviceName: string;
  organizationName: string;
  organizationFiscalCode: string;
  title: string;
  timeToLive?: TimeToLiveSeconds;
  hasPrecondition: boolean;
};

/** Domain-specific representation of a Message details */
export type UIMessageDetails = {
  id: string;
  subject: string;
  serviceId: ServiceId;
  markdown: MessageBodyMarkdown;
  dueDate?: Date;
  paymentData?: PaymentData;
  euCovidCertificate?: EUCovidCertificate;
  hasThirdPartyData: boolean;
  hasRemoteContent: boolean;
};

export type EUCovidCertificate = { authCode: string };

export type PaymentData = {
  payee: {
    fiscalCode: OrganizationFiscalCode;
  };
  amount: PaymentAmount;
  invalidAfterDueDate?: boolean;
  noticeNumber: PaymentNoticeNumber;
};
