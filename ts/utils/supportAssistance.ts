import ZendDesk from "io-react-native-zendesk";
import { fromNullable } from "fp-ts/lib/Option";
import { ZendeskConfig } from "../../definitions/content/ZendeskConfig";

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

// If is not possible to get the Zendesk remote config assume it as active.
export const isZendeskActiveRemotely = (zRC: ZendeskConfig | undefined) =>
  fromNullable(zRC).fold(true, zRC => zRC.active);

export const initSupportAssistance = ZendDesk.init;
export const setUserIdentity = ZendDesk.setUserIdentity;
export const openSupportTicket = ZendDesk.openTicket;
export const showSupportTickets = ZendDesk.showTickets;
