import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { CreatedMessageWithContentAndAttachments } from "../../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { EnrichedMessage } from "../../../../../definitions/backend/EnrichedMessage";
import { MessageCategory } from "../../../../../definitions/backend/MessageCategory";
import { TagEnum } from "../../../../../definitions/backend/MessageCategoryBase";
import { MessageStatusAttributes } from "../../../../../definitions/backend/MessageStatusAttributes";
import { PublicMessage } from "../../../../../definitions/backend/PublicMessage";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { apiUrlPrefix } from "../../../../config";
import { ContentTypeValues } from "../../../../types/contentType";

import {
  Attachment,
  AttachmentType,
  EUCovidCertificate,
  PaymentData,
  PrescriptionData,
  UIAttachment,
  UIAttachmentId,
  UIMessage,
  UIMessageDetails,
  UIMessageId
} from "./types";

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
    hasPreconditions: enriched.has_precondition ?? false,
    raw: messageFromApi
  };
};

const getPrescriptionAttachments = ({
  attachments
}: CreatedMessageWithContentAndAttachments["content"]):
  | ReadonlyArray<Attachment>
  | undefined =>
  attachments?.map(({ name, content, mime_type }) => ({
    name,
    content,
    mimeType: mime_type
  }));

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

const getPrescriptionData = ({
  prescription_data
}: CreatedMessageWithContentAndAttachments["content"]):
  | PrescriptionData
  | undefined => {
  if (prescription_data) {
    return {
      nre: prescription_data.nre,
      iup: prescription_data.iup,
      prescriberFiscalCode: prescription_data.prescriber_fiscal_code
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
    prescriptionData: getPrescriptionData(content),
    prescriptionAttachments: getPrescriptionAttachments(content),
    markdown: content.markdown,
    dueDate,

    paymentData: getPaymentData(content),
    euCovidCertificate: getEUCovidCertificate(content),
    subject: content.subject,
    serviceId: messageFromApi.sender_service_id,
    hasThirdPartyDataAttachments:
      content.third_party_data?.has_attachments ?? false,
    raw: messageFromApi
  };
};

const generateAttachmentUrl = (messageId: string, attachmentUrl: string) =>
  `${apiUrlPrefix}/api/v1/third-party-messages/${messageId}/attachments/${attachmentUrl.replace(
    /^\//g, // note that attachmentUrl might contains a / at the beginning, so let's strip it
    ""
  )}`;

export const attachmentsFromThirdPartyMessage = (
  messageFromApi: ThirdPartyMessageWithContent,
  category: AttachmentType
): O.Option<Array<UIAttachment>> =>
  pipe(
    messageFromApi.third_party_message.attachments,
    O.fromNullable,
    O.map(thirdPartyMessageAttachmentArray =>
      thirdPartyMessageAttachmentArray.map(thirdPartyMessageAttachment =>
        attachmentFromThirdPartyMessage(
          messageFromApi.id,
          thirdPartyMessageAttachment,
          category
        )
      )
    )
  );

export const attachmentFromThirdPartyMessage = (
  thirdPartyMessageId: string,
  thirPartyMessageAttachment: ThirdPartyAttachment,
  category: AttachmentType
): UIAttachment => ({
  messageId: thirdPartyMessageId as UIMessageId,
  id: thirPartyMessageAttachment.id as string as UIAttachmentId,
  displayName: thirPartyMessageAttachment.name ?? thirPartyMessageAttachment.id,
  contentType:
    thirPartyMessageAttachment.content_type ??
    ContentTypeValues.applicationOctetStream,
  resourceUrl: {
    href: generateAttachmentUrl(
      thirdPartyMessageId,
      thirPartyMessageAttachment.url
    )
  },
  category
});
