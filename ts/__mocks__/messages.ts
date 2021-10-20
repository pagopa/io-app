import { FiscalCode } from "italia-ts-commons/lib/strings";

import { TimeToLiveSeconds } from "../../definitions/backend/TimeToLiveSeconds";
import { ServiceId } from "../../definitions/backend/ServiceId";
import { ServicePublic } from "../../definitions/backend/ServicePublic";
import { ReloadMessagesPayload } from "../store/actions/messages";

const timeToLive = 3600 as unknown as TimeToLiveSeconds;

export const messageId_1 = "FAT00001";
export const messageId_2 = "PMT00002";
export const messageId_3 = "PMT00003";
export const serviceId_1 = "service_one" as ServiceId;
export const serviceId_2 = "service_two" as ServiceId;

export const service_1 = {
  service_id: serviceId_1,
  service_name: "health",
  organization_name: "Ċentru tas-Saħħa",
  department_name: "covid-19"
} as ServicePublic;

export const apiPayload = {
  items: [
    {
      id: messageId_1,
      fiscal_code: "TAMMRA80A41H501I",
      created_at: "2021-10-18T16:00:35.541Z",
      sender_service_id: serviceId_1,
      time_to_live: 3600,
      service_name: service_1.service_name,
      organization_name: service_1.organization_name,
      message_title: "Għandek flus?"
    },
    {
      id: messageId_2,
      fiscal_code: "TAMMRA80A41H501I",
      created_at: "2021-10-18T16:00:34.541Z",
      sender_service_id: serviceId_1,
      time_to_live: 3600,
      service_name: service_1.service_name,
      organization_name: service_1.organization_name,
      message_title: "Analiżi tad-demm"
    },
    {
      id: messageId_3,
      fiscal_code: "TAMMRA80A41H501I",
      created_at: "2021-10-18T16:00:30.541Z",
      sender_service_id: serviceId_2,
      time_to_live: 3600,
      service_name: "alert",
      organization_name: "Наркомвнудел",
      message_title: "позвоните нам!"
    }
  ],
  prev: undefined,
  next: "00"
};

export const successPayload: ReloadMessagesPayload = {
  messages: [
    {
      id: messageId_1,
      fiscalCode: apiPayload.items[0].fiscal_code as FiscalCode,
      createdAt: "2021-10-18T16:00:35.541Z" as any,
      serviceId: serviceId_1,
      timeToLive,
      serviceName: service_1.service_name,
      organizationName: service_1.organization_name,
      title: "Għandek flus?"
    },
    {
      id: messageId_2,
      fiscalCode: apiPayload.items[1].fiscal_code as FiscalCode,
      createdAt: "2021-10-18T16:00:34.541Z" as any,
      serviceId: serviceId_1,
      timeToLive,
      serviceName: service_1.service_name,
      organizationName: service_1.organization_name,
      title: "Analiżi tad-demm"
    },
    {
      id: messageId_3,
      fiscalCode: apiPayload.items[2].fiscal_code as FiscalCode,
      createdAt: "2021-10-18T16:00:30.541Z" as any,
      serviceId: serviceId_2,
      timeToLive,
      serviceName: "alert",
      organizationName: "Наркомвнудел",
      title: "позвоните нам!"
    }
  ],
  pagination: {
    previous: undefined,
    next: "00"
  }
};
