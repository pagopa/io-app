import { IUnitTag } from "@pagopa/ts-commons/lib/units";
import { CreatedMessageWithContentAndAttachments } from "../../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { FiscalCode } from "../../../../../definitions/backend/FiscalCode";
import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { OrganizationFiscalCode } from "../../../../../definitions/backend/OrganizationFiscalCode";
import { PaymentAmount } from "../../../../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../../../../definitions/backend/PaymentNoticeNumber";
import { PublicMessage } from "../../../../../definitions/backend/PublicMessage";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { TimeToLiveSeconds } from "../../../../../definitions/backend/TimeToLiveSeconds";
import { MessageCategory } from "../../../../../definitions/backend/MessageCategory";

/**
 * The unique ID of a UIMessage and UIMessageDetails, used to avoid passing the wrong ID as parameters
 */
export type UIMessageId = string & IUnitTag<"UIMessageId">;

export type WithUIMessageId<T> = T & {
  id: UIMessageId;
};

/**
 * Domain-specific representation of a Message with aggregated data.
 */
export type UIMessage = WithUIMessageId<{
  fiscalCode: FiscalCode;
  category: MessageCategory;
  createdAt: Date;
  serviceId: ServiceId;
  serviceName: string;
  organizationName: string;
  title: string;
  timeToLive?: TimeToLiveSeconds;

  // @deprecated please use it only for backward compatibility
  raw: PublicMessage;
}>;

/**
 * Domain-specific representation of a Message details
 */
export type UIMessageDetails = WithUIMessageId<{
  prescriptionData?: PrescriptionData;
  attachments?: ReadonlyArray<Attachment>;
  markdown: MessageBodyMarkdown;
  dueDate?: Date;
  paymentData?: PaymentData;
  euCovidCertificate?: EUCovidCertificate;

  // @deprecated please use it only for backward compatibility
  raw: CreatedMessageWithContentAndAttachments;
}>;

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
