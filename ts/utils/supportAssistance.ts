import ZendDesk from "io-react-native-zendesk";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ToolEnum } from "../../definitions/content/AssistanceToolConfig";
import { ZendeskCategory } from "../../definitions/content/ZendeskCategory";
import { ZendeskConfig } from "../features/zendesk/store/reducers";
import { getValueOrElse } from "../features/bonus/bpd/model/RemoteValue";
import { zendeskEnabled } from "../config";

export type ZendeskAppConfig = {
  key: string;
  appId: string;
  clientId: string;
  url: string;
  logId: string;
  token?: string;
};
export type JwtIdentity = ZendDesk.JwtIdentity;
export type AnonymousIdentity = ZendDesk.AnonymousIdentity;

// Id of the log customField
const logId = "4413845142673";

export const anonymousAssistanceAddress = "io@assistenza.pagopa.it";

export const anonymousAssistanceAddressWithSubject = (
  category: string,
  subcategory?: string
): string =>
  `mailto:${anonymousAssistanceAddress}?subject=${category}${pipe(
    subcategory,
    O.fromNullable,
    O.fold(
      () => "",
      s => ": " + s
    )
  )}`;

export const zendeskDefaultJwtConfig: ZendeskAppConfig = {
  key: "mp9agCp6LWusBxvHIGbeBmfI0wMeLIJM",
  appId: "4ed72c757f79ed15dfa46546dcb672fc86a0af949a119156",
  clientId: "mobile_sdk_client_28679ae6f72da9ab5ef0",
  url: "https://appio.zendesk.com",
  logId
};
export const zendeskDefaultAnonymousConfig: ZendeskAppConfig = {
  key: "mp9agCp6LWusBxvHIGbeBmfI0wMeLIJM",
  appId: "a6f500a77dc0bd00f25a5306e4217ea37c11d0e7fed1e768",
  clientId: "mobile_sdk_client_aa8f9ebd96018279049b",
  url: "https://appio.zendesk.com",
  logId
};

// If is not possible to get the assistance tool remotely assume it is none.
export const assistanceToolRemoteConfig = (aTC: ToolEnum | undefined) =>
  pipe(
    aTC,
    O.fromNullable,
    O.getOrElse(() => ToolEnum.none)
  );

// If is not possible to get the zendeskConfig remotely assume panicMode is not active.
export const isPanicModeActive = (zendeskConfig: ZendeskConfig) =>
  getValueOrElse(zendeskConfig, { panicMode: false }).panicMode;

export const initSupportAssistance = ZendDesk.init;
export const setUserIdentity = ZendDesk.setUserIdentity;
export const openSupportTicket = ZendDesk.openTicket;
export const showSupportTickets = ZendDesk.showTickets;
export const resetCustomFields = ZendDesk.resetCustomFields;
export const resetLog = ZendDesk.resetLog;
export const resetTag = ZendDesk.resetTags;
export const addTicketCustomField = ZendDesk.addTicketCustomField;
export const appendLog = ZendDesk.appendLog;
export const hasOpenedTickets = ZendDesk.hasOpenedTickets;
export const addTicketTag = ZendDesk.addTicketTag;
/**
 * Only iOS: close the current Zendesk UI (ticket creation or tickets list)
 * On Android this function has no effect
 */
export const dismissSupport = ZendDesk.dismiss;
export const zendeskCategoryId = "1900004702053";
export const zendeskBlockedPaymentRptIdId = "4414297346833";
export const zendeskPaymentOrgFiscalCode = "13442126418705";
export const zendeskPaymentStartOrigin = "13442129971473";
export const zendeskPaymentFailure = "13442145527057";
export const zendeskPaymentNav = "13442200871953";
export const zendeskDeviceAndOSId = "4414316795921";
export const zendeskidentityProviderId = "4414310934673";
export const zendeskCurrentAppVersionId = "4414316660369";
export const zendeskVersionsHistoryId = "4419641151505";
export const zendeskFciId = "14874226407825";
export const zendeskPaymentCategory: ZendeskCategory = {
  value: "pagamenti_pagopa",
  description: { "it-IT": "Pagamento pagoPA", "en-EN": "pagoPA payment" }
};
export const zendeskPaymentMethodCategory: ZendeskCategory = {
  value: "metodo_di_pagamento",
  description: {
    "it-IT": "Metodo di pagamento",
    "en-EN": "Payment method"
  }
};
export const zendeskFCICategory: ZendeskCategory = {
  value: "firma_con_io",
  description: {
    "it-IT": "Firma con IO",
    "en-EN": "Firma con IO"
  }
};

export const resetAssistanceData = () => {
  resetCustomFields();
  resetLog();
  resetTag();
};

// return true if zendeskSubCategories is defined and subCategories > 0
export const hasSubCategories = (zendeskCategory: ZendeskCategory): boolean =>
  (zendeskCategory.zendeskSubCategories?.subCategories ?? []).length > 0;
// help can be shown only when remote FF is  zendesk + local FF + emailValidated
export const canShowHelp = (
  assistanceTool: ToolEnum,
  isEmailValidated: boolean
): boolean => {
  switch (assistanceTool) {
    case ToolEnum.zendesk:
      return zendeskEnabled && isEmailValidated;
    case ToolEnum.instabug:
    case ToolEnum.web:
    case ToolEnum.none:
      return false;
  }
};
// Send a log based on
export const handleSendAssistanceLog = (
  assistanceTool: ToolEnum,
  log: string
) => {
  switch (assistanceTool) {
    case ToolEnum.zendesk:
      appendLog(log);
  }
};
