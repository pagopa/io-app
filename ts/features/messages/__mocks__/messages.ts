import { MessageCategory } from "../../../../definitions/backend/communication/MessageCategory";
import { TimeToLiveSeconds } from "../../../../definitions/backend/communication/TimeToLiveSeconds";
import { OrganizationFiscalCode } from "../../../../definitions/services/OrganizationFiscalCode";
import { ServiceDetails } from "../../../../definitions/services/ServiceDetails";
import { ServiceId } from "../../../../definitions/services/ServiceId";
import {
  NextPageMessagesSuccessPayload,
  PreviousPageMessagesSuccessPayload,
  ReloadMessagesPayload
} from "../store/actions";

export const defaultRequestPayload = {
  pageSize: 12,
  filter: { getArchived: false },
  fromUserAction: false
};

export const defaultRequestError = {
  error: new Error("нет войне"),
  filter: defaultRequestPayload.filter
};

const timeToLive = 3600 as unknown as TimeToLiveSeconds;

export const messageId_1 = "PMT00003";
export const messageId_2 = "PMT00002";
export const messageId_3 = "FAT00001";
export const serviceId_1 = "service_one" as ServiceId;
export const serviceId_2 = "service_two" as ServiceId;

export const service_1 = {
  id: serviceId_1,
  name: "health",
  organization: {
    fiscal_code: "FSCLCD" as OrganizationFiscalCode,
    name: "Ċentru tas-Saħħa"
  }
} as ServiceDetails;

export const service_2 = {
  id: serviceId_2,
  name: "alert",
  organization: {
    fiscal_code: "CDFSCL" as OrganizationFiscalCode,
    name: "Наркомвнудел"
  }
} as ServiceDetails;

export const apiPayload = {
  items: [
    {
      id: messageId_1,
      fiscal_code: "TAMMRA80A41H501I",
      created_at: "2021-10-18T16:00:35.541Z",
      is_archived: false,
      is_read: true,
      sender_service_id: serviceId_1,
      time_to_live: 3600,
      service_name: service_1.name,
      organization_name: service_1.organization.name,
      organization_fiscal_code: service_1.organization.fiscal_code,
      message_title: "Għandek flus?"
    },
    {
      id: messageId_2,
      fiscal_code: "TAMMRA80A41H501I",
      created_at: "2021-10-18T16:00:34.541Z",
      is_archived: false,
      is_read: false,
      sender_service_id: serviceId_1,
      time_to_live: 3600,
      service_name: service_1.name,
      organization_name: service_1.organization.name,
      organization_fiscal_code: service_1.organization.fiscal_code,
      message_title: "Analiżi tad-demm"
    },
    {
      id: messageId_3,
      fiscal_code: "TAMMRA80A41H501I",
      created_at: "2021-10-18T16:00:30.541Z",
      is_archived: true,
      is_read: true,
      sender_service_id: serviceId_2,
      time_to_live: 3600,
      service_name: "alert",
      organization_name: "Наркомвнудел",
      organization_fiscal_code: "CDFSCL",
      message_title: "позвоните нам!"
    }
  ],
  prev: messageId_1,
  next: messageId_3
};

const successPayloadMessages: ReloadMessagesPayload["messages"] = [
  {
    id: messageId_1,
    category: { tag: "GENERIC" } as MessageCategory,
    createdAt: new Date("2021-10-18T16:00:35.541Z"),
    isArchived: false,
    isRead: true,
    serviceId: serviceId_1,
    timeToLive,
    serviceName: service_1.name,
    organizationName: service_1.organization.name,
    organizationFiscalCode: service_1.organization.fiscal_code,
    title: "Għandek flus?",
    hasPrecondition: false
  },
  {
    id: messageId_2,
    category: { tag: "GENERIC" } as MessageCategory,
    createdAt: new Date("2021-10-18T16:00:34.541Z"),
    isRead: false,
    isArchived: false,
    serviceId: serviceId_1,
    timeToLive,
    serviceName: service_1.name,
    organizationName: service_1.organization.name,
    organizationFiscalCode: service_1.organization.fiscal_code,
    title: "Analiżi tad-demm",
    hasPrecondition: false
  },
  {
    id: messageId_3,
    category: { tag: "GENERIC" } as MessageCategory,
    createdAt: new Date("2021-10-18T16:00:30.541Z"),
    isArchived: true,
    isRead: true,
    serviceId: serviceId_2,
    timeToLive,
    serviceName: service_2.name,
    organizationName: service_2.organization.name,
    organizationFiscalCode: service_2.organization.fiscal_code,
    title: "позвоните нам!",
    hasPrecondition: false
  }
];

export const successReloadMessagesPayload: ReloadMessagesPayload = {
  messages: successPayloadMessages,
  pagination: {
    previous: successPayloadMessages[0].id,
    next: successPayloadMessages[2].id
  },
  filter: defaultRequestPayload.filter,
  fromUserAction: false
};

export const successLoadNextPageMessagesPayload: NextPageMessagesSuccessPayload =
  {
    messages: successPayloadMessages,
    pagination: {
      next: successPayloadMessages[2].id
    },
    filter: defaultRequestPayload.filter,
    fromUserAction: false
  };

export const successLoadPreviousPageMessagesPayload: PreviousPageMessagesSuccessPayload =
  {
    messages: successPayloadMessages,
    pagination: {
      previous: successPayloadMessages[0].id
    },
    filter: defaultRequestPayload.filter,
    fromUserAction: false
  };
