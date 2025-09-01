import { MessageBodyMarkdown } from "../../../../definitions/backend/MessageBodyMarkdown";
import { OrganizationFiscalCode } from "../../../../definitions/backend/OrganizationFiscalCode";
import { PaymentAmount } from "../../../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../../../definitions/backend/PaymentNoticeNumber";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { TimeToLiveSeconds } from "../../../../definitions/backend/TimeToLiveSeconds";
import { MessageCategory } from "../../../../definitions/backend/MessageCategory";
/**
 * Domain-specific representation of a Message with aggregated data.
 */
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

/**
 * Domain-specific representation of a Message details
 */
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
