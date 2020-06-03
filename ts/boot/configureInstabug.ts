import { Option } from "fp-ts/lib/Option";
import Instabug, {
  BugReporting,
  Chats,
  NetworkLogger,
  Replies
} from "instabug-reactnative";

import { Locales } from "../../locales/locales";
import { instabugToken } from "../config";
import I18n from "../i18n";
import { IdentityProvider } from "../models/IdentityProvider";
import variables from "../theme/variables";
import { isDevEnv } from "../utils/environment";

type InstabugLocales = { [k in Locales]: Instabug.locale };

type InstabugUserAttributeKeys =
  | "backendVersion"
  | "activeScreen"
  | "fiscalcode"
  | "identityProvider"
  | "lastSeenMessageID"
  | "blockedPaymentRptId";

const instabugLocales: InstabugLocales = {
  en: Instabug.locale.english,
  it: Instabug.locale.italian
};

export enum TypeLogs {
  "INFO" = "INFO",
  "VERBOSE" = "VERBOSE",
  "ERROR" = "ERROR",
  "DEBUG" = "DEBUG",
  "WARN" = "WARN"
}

type InstabugLoggerType = {
  [key in keyof typeof TypeLogs]: (value: string) => void
};
const InstabugLogger: InstabugLoggerType = {
  INFO: Instabug.logInfo,
  VERBOSE: Instabug.logVerbose,
  ERROR: Instabug.logError,
  DEBUG: Instabug.logDebug,
  WARN: Instabug.logWarn
};

export const initialiseInstabug = () => {
  // Initialise Instabug for iOS. The Android initialisation is inside MainApplication.java
  Instabug.startWithToken(instabugToken, [Instabug.invocationEvent.none]);
  // it seems NetworkLogger.setEnabled(false) turns off all network interceptions
  // this may cause an empty timeline in Reactotron too
  if (!isDevEnv) {
    // avoid Instabug to log network requests
    NetworkLogger.setEnabled(false);
  }

  // Set primary color for iOS. The Android's counterpart is inside MainApplication.java
  Instabug.setPrimaryColor(variables.contentPrimaryBackground);

  Instabug.setColorTheme(Instabug.colorTheme.light);

  // Set the language for Instabug ui/screens
  Instabug.setLocale(
    I18n.currentLocale().startsWith("it")
      ? instabugLocales.it
      : instabugLocales.en
  );
};

export const openInstabugBugReport = () => {
  BugReporting.showWithOptions(BugReporting.reportType.bug, [
    BugReporting.option.commentFieldRequired,
    BugReporting.option.emailFieldOptional
  ]);
};

export const openInstabugChat = (hasChats: boolean = false) => {
  if (hasChats) {
    Replies.show();
  } else {
    Chats.show();
  }
};

export const setInstabugUserAttribute = (
  attributeKey: InstabugUserAttributeKeys,
  attributeValue: string
) => {
  Instabug.setUserAttribute(attributeKey, attributeValue);
};

export const setInstabugProfileAttributes = (
  maybeIdp: Option<IdentityProvider>
) => {
  maybeIdp.fold(undefined, (idp: IdentityProvider) =>
    setInstabugUserAttribute("identityProvider", idp.entityID)
  );
};

export const instabugLog = (log: string, typeLog: TypeLogs) => {
  InstabugLogger[typeLog](log);
};

const maxInstabugStringLength = 4096;
const numberMargin = 15;

export const instabugLogChunked = (
  log: string,
  typeLog: TypeLogs,
  prefix?: string
) => {
  const chunckSize =
    maxInstabugStringLength - (prefix ? prefix.length : 0) - numberMargin;

  const chunks = log.match(new RegExp(".{1," + chunckSize + "}", "g"));
  if (chunks) {
    chunks.forEach((chunk, i) => {
      const count = chunks.length > 1 ? ` ${i + 1}/${chunks.length}` : "";
      InstabugLogger[typeLog](`[${prefix}${count}] ${chunk}`);
    });
  }
};
