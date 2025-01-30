import { IUnitTag } from "@pagopa/ts-commons/lib/units";
import { CreatedMessageWithContentAndAttachments } from "../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { FiscalCode } from "../../../../definitions/backend/FiscalCode";
import { MessageBodyMarkdown } from "../../../../definitions/backend/MessageBodyMarkdown";
import { OrganizationFiscalCode } from "../../../../definitions/backend/OrganizationFiscalCode";
import { PaymentAmount } from "../../../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../../../definitions/backend/PaymentNoticeNumber";
import { PublicMessage } from "../../../../definitions/backend/PublicMessage";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { TimeToLiveSeconds } from "../../../../definitions/backend/TimeToLiveSeconds";
import { MessageCategory } from "../../../../definitions/backend/MessageCategory";

/**
 * The unique ID of a UIMessage and UIMessageDetails, used to avoid passing the wrong ID as parameters
 */
export type UIMessageId = string & IUnitTag<"UIMessageId">;

export type WithUIMessageId<T> = T & {
  id: UIMessageId;
};

/**
 * Domain-specific representation of a Message with aggregated data
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
  organizationFiscalCode: string;
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
  markdown: MessageBodyMarkdown;
  dueDate?: Date;
  paymentData?: PaymentData;
  euCovidCertificate?: EUCovidCertificate;
  hasThirdPartyData: boolean;
  hasRemoteContent: boolean;
  // @deprecated please use it only for backward compatibility
  raw: CreatedMessageWithContentAndAttachments;
}>;

export type EUCovidCertificate = { authCode: string };

export type PaymentData = {
  payee: {
    fiscalCode: OrganizationFiscalCode;
  };
  amount: PaymentAmount;
  invalidAfterDueDate?: boolean;
  noticeNumber: PaymentNoticeNumber;
};
