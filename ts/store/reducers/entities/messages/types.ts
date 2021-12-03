import { FiscalCode } from "../../../../../definitions/backend/FiscalCode";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { TimeToLiveSeconds } from "../../../../../definitions/backend/TimeToLiveSeconds";
import { PaymentAmount } from "../../../../../definitions/backend/PaymentAmount";
import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { PaymentNoticeNumber } from "../../../../../definitions/backend/PaymentNoticeNumber";
import { OrganizationFiscalCode } from "../../../../../definitions/backend/OrganizationFiscalCode";
import { CreatedMessageWithContentAndAttachments } from "../../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { PublicMessage } from "../../../../../definitions/backend/PublicMessage";

// TODO: use type from API definitions once they are available
export type MessageCategory =
  | { tag: "EU_COVID_CERT" }
  | { tag: "PAYMENT"; rptId: string }
  | { tag: "GENERIC" };

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
  serviceName: string;
  organizationName: string;
  title: string;
  timeToLive?: TimeToLiveSeconds;

  // @deprecated please use it only for backward compatibility
  raw: PublicMessage;
};

/**
 * Domain-specific representation of a Message details
 */
export type UIMessageDetails = {
  id: string;
  prescriptionData?: PrescriptionData;
  attachments?: ReadonlyArray<Attachment>;
  markdown: MessageBodyMarkdown;
  dueDate?: Date;
  paymentData?: PaymentData;
  euCovidCertificate?: EUCovidCertificate;

  // @deprecated please use it only for backward compatibility
  raw: CreatedMessageWithContentAndAttachments;
};

export type PrescriptionData = {
  nre: string;
  iup?: string;
  prescriberFiscalCode?: FiscalCode;
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

export type Attachment = {
  name: string;
  content: string;
  mimeType: string;
};
