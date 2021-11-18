import { FiscalCode } from "../../../../../definitions/backend/FiscalCode";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { TimeToLiveSeconds } from "../../../../../definitions/backend/TimeToLiveSeconds";
import { PaymentAmount } from "../../../../../definitions/backend/PaymentAmount";
import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { PaymentNoticeNumber } from "../../../../../definitions/backend/PaymentNoticeNumber";
import { OrganizationFiscalCode } from "../../../../../definitions/backend/OrganizationFiscalCode";

// just a placeholder for now
export type MessageCategory = null;

/**
 * Domain-specific representation of a Message with aggregated data.
 */
export type UIMessage = {
  id: string;
  fiscalCode: FiscalCode;
  // TODO:  https://pagopa.atlassian.net/browse/IA-417
  //        and https://pagopa.atlassian.net/browse/IA-418
  category: MessageCategory;
  createdAt: Date;
  serviceId: ServiceId;
  serviceName?: string;
  organizationName?: string;
  title: string;
  timeToLive?: TimeToLiveSeconds;
  paymentData?: {
    paid: boolean;
  };
};

/**
 * Domain-specific representation of a Message details
 */
export type UIMessageDetails = {
  id: string;
  prescriptionData?: {
    nre: string;
    iup?: string;
    prescriberFiscalCode: FiscalCode;
  };
  attachments?: ReadonlyArray<Attachment>;
  markdown: MessageBodyMarkdown;
  dueDate?: Date;
  paymentData?: PaymentData;
  greenPass?: { authCode: string };
};

export type PaymentData = {
  payee: {
    fiscalCode: OrganizationFiscalCode;
  };
  amount: PaymentAmount;
  invalidAfterDueDate?: boolean;
  noticeNumber: PaymentNoticeNumber;
};

export type Attachment = {
  name: string;
  content: string;
  mimeType: string;
};
