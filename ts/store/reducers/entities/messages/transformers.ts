import { PublicMessage } from "../../../../../definitions/backend/PublicMessage";
import { EnrichedMessage } from "../../../../../definitions/backend/EnrichedMessage";
import { CreatedMessageWithContentAndAttachments } from "../../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { MessageCategory } from "../../../../../definitions/backend/MessageCategory";
import { TagEnum } from "../../../../../definitions/backend/MessageCategoryBase";

import {
  Attachment,
  EUCovidCertificate,
  PaymentData,
  PrescriptionData,
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
export const toUIMessage = (messageFromApi: PublicMessage): UIMessage => {
  const enriched = messageFromApi as EnrichedMessage;
  const category: MessageCategory = enriched.category || {
    tag: TagEnum.GENERIC
  };
  return {
    id: messageFromApi.id as UIMessageId,
    fiscalCode: messageFromApi.fiscal_code,
    category,
    createdAt: new Date(messageFromApi.created_at),
    serviceId: messageFromApi.sender_service_id,
    serviceName: enriched.service_name,
    organizationName: enriched.organization_name,
    title: enriched.message_title,
    timeToLive: messageFromApi.time_to_live,
    raw: messageFromApi
  };
};

const getAttachments = ({
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
    attachments: getAttachments(content),
    markdown: content.markdown,
    dueDate,
    paymentData: getPaymentData(content),
    euCovidCertificate: getEUCovidCertificate(content),
    raw: messageFromApi
  };
};
