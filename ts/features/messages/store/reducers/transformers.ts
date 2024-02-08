import { CreatedMessageWithContentAndAttachments } from "../../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { EnrichedMessage } from "../../../../../definitions/backend/EnrichedMessage";
import { MessageCategory } from "../../../../../definitions/backend/MessageCategory";
import { TagEnum } from "../../../../../definitions/backend/MessageCategoryBase";
import { MessageStatusAttributes } from "../../../../../definitions/backend/MessageStatusAttributes";
import { PublicMessage } from "../../../../../definitions/backend/PublicMessage";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { apiUrlPrefix } from "../../../../config";
import { ContentTypeValues } from "../../types/contentType";
import {
  EUCovidCertificate,
  PaymentData,
  UIMessage,
  UIMessageDetails,
  UIMessageId
} from "../../types";

/**
 * Map an enriched message item from API to the app domain.
 * Since `category` is optional, it falls back on GENERIC.
 *
 * @param messageFromApi
 */
export const toUIMessage = (
  messageFromApi: PublicMessage | CreatedMessageWithContentAndAttachments
): UIMessage => {
  const enriched = messageFromApi as EnrichedMessage;
  const category: MessageCategory = enriched.category || {
    tag: TagEnum.GENERIC
  };
  const { is_read, is_archived } = messageFromApi as MessageStatusAttributes;
  return {
    id: messageFromApi.id as UIMessageId,
    fiscalCode: messageFromApi.fiscal_code,
    category,
    createdAt: new Date(messageFromApi.created_at),
    isRead: Boolean(is_read),
    isArchived: Boolean(is_archived),
    serviceId: messageFromApi.sender_service_id,
    serviceName: enriched.service_name,
    organizationName: enriched.organization_name,
    title: enriched.message_title,
    timeToLive: messageFromApi.time_to_live,
    hasPrecondition: enriched.has_precondition ?? false,
    raw: messageFromApi
  };
};

const getPaymentData = ({
  payment_data
}: CreatedMessageWithContentAndAttachments["content"]):
  | PaymentData
  | undefined => {
  if (payment_data) {
    return {
      payee: {
        fiscalCode: payment_data.payee.fiscal_code
      },
      amount: payment_data.amount,
      noticeNumber: payment_data.notice_number
    };
  }
  return undefined;
};

const getEUCovidCertificate = ({
  eu_covid_cert
}: CreatedMessageWithContentAndAttachments["content"]):
  | EUCovidCertificate
  | undefined => {
  if (eu_covid_cert) {
    return {
      authCode: eu_covid_cert.auth_code
    };
  }
  return undefined;
};

/**
 * Map the entire message details from API to the app domain.
 *
 * @param messageFromApi
 */
export const toUIMessageDetails = (
  messageFromApi: CreatedMessageWithContentAndAttachments
): UIMessageDetails => {
  const { id, content } = messageFromApi;
  const dueDate = content.due_date ? new Date(content.due_date) : undefined;

  return {
    id: id as UIMessageId,
    markdown: content.markdown,
    dueDate,

    paymentData: getPaymentData(content),
    euCovidCertificate: getEUCovidCertificate(content),
    subject: content.subject,
    serviceId: messageFromApi.sender_service_id,
    hasThirdPartyData: !!content.third_party_data,
    hasRemoteContent: !!content.third_party_data?.has_remote_content,
    raw: messageFromApi
  };
};

export const attachmentDisplayName = (attachment: ThirdPartyAttachment) =>
  attachment.name ?? attachment.id;
export const attachmentContentType = (attachment: ThirdPartyAttachment) =>
  attachment.content_type ?? ContentTypeValues.applicationOctetStream;
export const attachmentDownloadUrl = (
  messageId: UIMessageId,
  attachment: ThirdPartyAttachment
) =>
  `${apiUrlPrefix}/api/v1/third-party-messages/${messageId}/attachments/${attachment.url.replace(
    /^\//g, // note that attachmentUrl might contains a / at the beginning, so let's strip it
    ""
  )}`;
