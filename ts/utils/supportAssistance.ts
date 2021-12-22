import ZendDesk from "io-react-native-zendesk";
import { fromNullable } from "fp-ts/lib/Option";
import { ToolEnum } from "../../definitions/content/AssistanceToolConfig";
import { ZendeskCategory } from "../../definitions/content/ZendeskCategory";
import { ZendeskConfig } from "../features/zendesk/store/reducers";
import { getValueOrElse } from "../features/bonus/bpd/model/RemoteValue";
import { zendeskEnabled } from "../config";
import { instabugLog, TypeLogs } from "../boot/configureInstabug";

export type ZendeskAppConfig = {
  key: string;
  appId: string;
  clientId: string;
  url: string;
  token?: string;
};
export type JwtIdentity = ZendDesk.JwtIdentity;
export type AnonymousIdentity = ZendDesk.AnonymousIdentity;

export const zendeskDefaultJwtConfig: ZendeskAppConfig = {
  key: "mp9agCp6LWusBxvHIGbeBmfI0wMeLIJM",
  appId: "4ed72c757f79ed15dfa46546dcb672fc86a0af949a119156",
  clientId: "mobile_sdk_client_28679ae6f72da9ab5ef0",
  url: "https://appio.zendesk.com"
};
export const zendeskDefaultAnonymousConfig: ZendeskAppConfig = {
  key: "mp9agCp6LWusBxvHIGbeBmfI0wMeLIJM",
  appId: "a6f500a77dc0bd00f25a5306e4217ea37c11d0e7fed1e768",
  clientId: "mobile_sdk_client_aa8f9ebd96018279049b",
  url: "https://appio.zendesk.com"
};

// If is not possible to get the assistance tool remotely assume it is none.
export const assistanceToolRemoteConfig = (aTC: ToolEnum | undefined) =>
  fromNullable(aTC).getOrElse(ToolEnum.none);

// If is not possible to get the zendeskConfig remotely assume panicMode is not active.
export const isPanicModeActive = (zendeskConfig: ZendeskConfig) =>
  getValueOrElse(zendeskConfig, { panicMode: false }).panicMode;

export const initSupportAssistance = ZendDesk.init;
export const setUserIdentity = ZendDesk.setUserIdentity;
export const openSupportTicket = ZendDesk.openTicket;
export const showSupportTickets = ZendDesk.showTickets;
export const resetAssistanceData = ZendDesk.reset;
export const addTicketCustomField = ZendDesk.addTicketCustomField;
export const appendLog = ZendDesk.appendLog;
export const hasOpenedTickets = ZendDesk.hasOpenedTickets;
export const zendeskCategoryId = "1900004702053";
export const zendeskBlockedPaymentRptIdId = "4414297346833";
export const zendeskDeviceAndOSId = "4414316795921";
export const zendeskidentityProviderId = "4414310934673";
export const zendeskCurrentAppVersionId = "4414316660369";
export const zendeskPaymentCategoryValue = "pagamenti_pagopa";
export const zendeskPaymentMethodCategoryValue = "metodo_di_pagamento";

// return true if zendeskSubCategories is defined and subCategories > 0
export const hasSubCategories = (zendeskCategory: ZendeskCategory): boolean =>
  (zendeskCategory.zendeskSubCategories?.subCategories ?? []).length > 0;

// help can be shown only when remote FF is instabug or (zendesk + local FF + emailValidated)
export const canShowHelp = (
  assistanceTool: ToolEnum,
  isEmailValidated: boolean
): boolean => {
  switch (assistanceTool) {
    case ToolEnum.instabug:
      return true;
    case ToolEnum.zendesk:
      return zendeskEnabled && isEmailValidated;
    case ToolEnum.web:
    case ToolEnum.none:
      return false;
  }
};

// Send a log based on
export const handleSendAssistanceLog = (
  assistanceTool: ToolEnum,
  log: string,
  instabugTypeLog?: TypeLogs,
  instabugTag?: string
) => {
  switch (assistanceTool) {
    case ToolEnum.instabug:
      instabugLog(log, instabugTypeLog ?? TypeLogs.INFO, instabugTag);
      break;
    case ToolEnum.zendesk:
      appendLog(log);
  }
};
