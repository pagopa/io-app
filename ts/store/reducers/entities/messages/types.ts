import { IUnitTag } from "@pagopa/ts-commons/lib/units";
import { ValidUrl } from "@pagopa/ts-commons/lib/url";
import { CreatedMessageWithContentAndAttachments } from "../../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { FiscalCode } from "../../../../../definitions/backend/FiscalCode";
import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { OrganizationFiscalCode } from "../../../../../definitions/backend/OrganizationFiscalCode";
import { PaymentAmount } from "../../../../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../../../../definitions/backend/PaymentNoticeNumber";
import { PublicMessage } from "../../../../../definitions/backend/PublicMessage";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { TimeToLiveSeconds } from "../../../../../definitions/backend/TimeToLiveSeconds";
import { getExpireStatus } from "../../../../utils/dates";
import { MessagePaymentExpirationInfo } from "../../../../utils/messages";
import { MessageCategory } from "../../../../../definitions/backend/MessageCategory";
import { Byte } from "../../../../types/digitalInformationUnit";

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
  isRead: boolean;
  isArchived: boolean;
  serviceId: ServiceId;
  serviceName: string;
  organizationName: string;
  title: string;
  timeToLive?: TimeToLiveSeconds;
  hasPrecondition: boolean;

  // @deprecated please use it only for backward compatibility
  raw: PublicMessage;
}>;

/**
 * Domain-specific representation of a Message details
 */
export type UIMessageDetails = WithUIMessageId<{
  subject: string;
  serviceId: ServiceId;
  prescriptionData?: PrescriptionData;
  prescriptionAttachments?: ReadonlyArray<Attachment>;
  markdown: MessageBodyMarkdown;
  dueDate?: Date;
  paymentData?: PaymentData;
  euCovidCertificate?: EUCovidCertificate;
  hasThirdPartyDataAttachments: boolean;
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

export type UIAttachmentId = string & IUnitTag<"UIAttachmentId">;
export type AttachmentType = "GENERIC" | "PN";

/**
 * Represent an attachment with the metadata and resourceUrl to retrieve the attachment
 */
export type UIAttachment = {
  // the message ID that contains the attachment
  messageId: UIMessageId;
  // the ID of the attachment (only guaranteed to be unique per message)
  id: UIAttachmentId;
  // a display name for the file
  displayName: string;
  // a generic content type for a file
  contentType: string;
  // size (in Byte) of the attachment, for display purpose
  size?: Byte;
  // The url that can be used to retrieve the resource
  resourceUrl: ValidUrl;
  // This category is needed to differentiate between generic and PN attachments
  // which has a different download handling
  category: AttachmentType;
};

export const getPaymentExpirationInfo = (
  messageDetails: UIMessageDetails
): MessagePaymentExpirationInfo => {
  const { paymentData, dueDate } = messageDetails;
  if (paymentData && dueDate) {
    const expireStatus = getExpireStatus(dueDate);
    return {
      kind: paymentData.invalidAfterDueDate ? "EXPIRABLE" : "UNEXPIRABLE",
      expireStatus,
      dueDate
    };
  }
  return {
    kind: "UNEXPIRABLE"
  };
};
