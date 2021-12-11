import ZendDesk from "io-react-native-zendesk";
import { fromNullable } from "fp-ts/lib/Option";
import { ToolEnum } from "../../definitions/content/AssistanceToolConfig";
import { ZendeskConfig } from "../features/zendesk/store/reducers";
import { getValueOrElse } from "../features/bonus/bpd/model/RemoteValue";

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
  appId: "7f23d5b0eadc5b4f2cc83df3898c6f607bad769fe053a186",
  clientId: "mobile_sdk_client_4bf774ed28b085195cc5",
  url: "https://appiotest.zendesk.com"
};
export const zendeskDefaultAnonymousConfig: ZendeskAppConfig = {
  key: "mp9agCp6LWusBxvHIGbeBmfI0wMeLIJM",
  appId: "8547479b47fdacd0e8f74a4fb076a41014dee620d1d890b3",
  clientId: "mobile_sdk_client_518ee6a8160220698f97",
  url: "https://appiotest.zendesk.com"
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
