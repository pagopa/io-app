import * as ZendDesk from "@pagopa/io-react-native-zendesk";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ToolEnum } from "../../definitions/content/AssistanceToolConfig";
import { ZendeskCategory } from "../../definitions/content/ZendeskCategory";
import { getValueOrElse } from "../common/model/RemoteValue";
import { zendeskEnabled } from "../config";
import { ZendeskConfig } from "../features/zendesk/store/reducers";

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

export const getZendeskConfig = (zendeskToken: string | undefined) =>
  pipe(
    zendeskToken,
    O.fromNullable,
    O.map(
      (zT: string): ZendeskAppConfig => ({
        ...zendeskDefaultJwtConfig,
        token: zT // this is actually not used by the zendesk sdk...
        // https://github.com/pagopa/io-react-native-zendesk/blob/main/ios/RNZendeskChat.m#L180
        // https://github.com/pagopa/io-react-native-zendesk/blob/main/index.d.ts#L75C3-L75C3
      })
    ),
    O.getOrElseW(() => zendeskDefaultAnonymousConfig)
  );

export const getZendeskIdentity = (zendeskToken: string | undefined) =>
  pipe(
    zendeskToken,
    O.fromNullable,
    O.map((zT: string): JwtIdentity | AnonymousIdentity => ({
      token: zT
    })),
    O.getOrElseW(() => ({}))
  );

// If is not possible to get the assistance tool remotely assume it is none.
export const assistanceToolRemoteConfig = (aTC: ToolEnum | undefined) =>
  pipe(
    aTC,
    O.fromNullable,
    O.getOrElseW(() => ToolEnum.none)
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
export const zendeskItWalletFailureCode = "31775197295633";
export const zendeskIdPayCategoryId = "8086481365265";

export const defaultZendeskPaymentCategory: ZendeskCategory = {
  value: "io_pagamenti_pagopa",
  description: {
    "it-IT": "Pagamento pagoPA",
    "en-EN": "pagoPA payment",
    "de-DE": "pagoPA-Zahlung"
  }
};

export const zendeskPaymentMethodCategory: ZendeskCategory = {
  value: "metodo_di_pagamento",
  description: {
    "it-IT": "Metodo di pagamento",
    "en-EN": "Payment method",
    "de-DE": "Zahlungsmethode"
  }
};
export const zendeskFCICategory: ZendeskCategory = {
  value: "firma_con_io",
  description: {
    "it-IT": "Firma con IO",
    "en-EN": "Firma con IO",
    "de-DE": "Firma con IO"
  }
};
export const zendeskItWalletCategory: ZendeskCategory = {
  value: "it_wallet",
  description: {
    "it-IT": "Documenti su IO",
    "en-EN": "Documenti su IO",
    "de-DE": "Dokumente in IO"
  }
};

export const defaultIdPayExpenseCategory: ZendeskCategory = {
  value: "idpay_guidonia",
  description: {
    "it-IT": "Pagamento pagoPA",
    "en-EN": "pagoPA payment",
    "de-DE": "pagoPA-Zahlung"
  }
};

export const defaultZendeskIDPayCategory: ZendeskCategory = {
  value: "idpay",
  description: {
    "it-IT": "IDPay",
    "en-EN": "IDPay",
    "de-DE": "IDPay"
  }
};

export const defaultZendeskBonusesCategory: ZendeskCategory = {
  value: "bonus_e_iniziative",
  description: {
    "it-IT": "Bonus e iniziative",
    "en-EN": "Bonuses and initiatives",
    "de-DE": "Bonus und Initiativen"
  }
};

export const zendeskSendCategory: ZendeskCategory = {
  value: "io_send",
  description: {
    "it-IT": "SEND",
    "en-EN": "SEND",
    "de-DE": "SEND"
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
export const canShowHelp = (assistanceTool: ToolEnum): boolean => {
  switch (assistanceTool) {
    case ToolEnum.zendesk:
      return zendeskEnabled;
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

export const PAGOPA_SUPPORT_PHONE_NUMBER = "0645202323";
