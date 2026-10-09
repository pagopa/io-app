import { requireNativeModule } from "expo-modules-core";

export interface AnonymousIdentity {
  email?: string;
  name?: string;
}

export interface ChatOptions extends UserInfo {
  botName?: string;
  chatOnly?: boolean;
  color?: string;
  disableTicketCreation?: boolean;
  withChat?: boolean;
}

export interface InitOptions {
  appId: string;
  clientId: string;
  key: string;
  logId: string;
  url: string;
}

export interface JwtIdentity {
  token: string;
}

interface ExpoZendeskModule {
  addTicketCustomField(key: string, value: string): void;
  addTicketTag(tag: string): void;
  appendLog(log: string): void;
  dismiss(): void;
  getTotalNewResponses(): Promise<number>;
  hasOpenedTickets(): Promise<number>;
  init(options: InitOptions): void;
  initChat(accountKey: string): void;
  openTicket(): Promise<void>;
  resetCustomFields(): void;
  resetLog(): void;
  resetTags(): void;
  resetUserIdentity(): void;
  setNotificationToken(token: string): void;
  setPrimaryColor(color: string): void;
  setUserIdentity(identity: AnonymousIdentity | JwtIdentity): void;
  setVisitorInfo(visitorInfo: UserInfo): void;
  showHelpCenter(options: ChatOptions): void;
  showTickets(): Promise<void>;
}

interface UserInfo extends AnonymousIdentity {
  department?: string;
  phone?: number;
  tags?: Array<string>;
}

const ExpoZendesk = requireNativeModule<ExpoZendeskModule>("ExpoZendesk");

export const init = (options: InitOptions): void => ExpoZendesk.init(options);
export const initChat = (key: string): void => ExpoZendesk.initChat(key);
export const setPrimaryColor = (color: string): void =>
  ExpoZendesk.setPrimaryColor(color);
export const showHelpCenter = (options: ChatOptions): void =>
  ExpoZendesk.showHelpCenter(options);
export const addTicketCustomField = (key: string, value: string): void =>
  ExpoZendesk.addTicketCustomField(key, value);
export const appendLog = (log: string): void => ExpoZendesk.appendLog(log);
export const addTicketTag = (tag: string): void =>
  ExpoZendesk.addTicketTag(tag);
export const resetCustomFields = (): void => ExpoZendesk.resetCustomFields();
export const resetTags = (): void => ExpoZendesk.resetTags();
export const resetLog = (): void => ExpoZendesk.resetLog();
export const dismiss = (): void => ExpoZendesk.dismiss();
export const openTicket = (onClose: () => void): void => {
  void ExpoZendesk.openTicket().then(onClose);
};
export const showTickets = (onClose: () => void): void => {
  void ExpoZendesk.showTickets().then(onClose);
};
export const hasOpenedTickets = (): Promise<number> =>
  ExpoZendesk.hasOpenedTickets();
export const getTotalNewResponses = (): Promise<number> =>
  ExpoZendesk.getTotalNewResponses();
export const setVisitorInfo = (visitorInfo: UserInfo): void =>
  ExpoZendesk.setVisitorInfo(visitorInfo);
export const setNotificationToken = (token: string): void =>
  ExpoZendesk.setNotificationToken(token);
export const setUserIdentity = (
  identity: AnonymousIdentity | JwtIdentity
): void => ExpoZendesk.setUserIdentity(identity);
export const resetUserIdentity = (): void => ExpoZendesk.resetUserIdentity();

export default {
  init,
  initChat,
  setPrimaryColor,
  showHelpCenter,
  addTicketCustomField,
  appendLog,
  addTicketTag,
  resetCustomFields,
  resetTags,
  resetLog,
  dismiss,
  openTicket,
  showTickets,
  hasOpenedTickets,
  getTotalNewResponses,
  setVisitorInfo,
  setNotificationToken,
  setUserIdentity,
  resetUserIdentity
};
