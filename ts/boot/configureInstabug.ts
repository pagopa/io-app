import { Option } from "fp-ts/lib/Option";
import Instabug from "instabug-reactnative";

import { Locales } from "../../locales/locales";
import { instabugToken } from "../config";
import I18n from "../i18n";
import { IdentityProvider } from "../models/IdentityProvider";
import variables from "../theme/variables";

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

export const initialiseInstabug = () => {
  // Initialise Instabug for iOS. The Android initialisation is inside MainApplication.java
  Instabug.startWithToken(instabugToken, [Instabug.invocationEvent.none]);

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

export const instabugLog = (logs: string, typeLog: TypeLogs) => {
  switch (typeLog) {
    case TypeLogs.INFO:
      Instabug.logInfo(logs);
    case TypeLogs.ERROR:
      Instabug.logError(logs);
    case TypeLogs.WARN:
      Instabug.logWarn(logs);
    case TypeLogs.VERBOSE:
      Instabug.logVerbose(logs);
    case TypeLogs.DEBUG:
      Instabug.logDebug(logs);
  }
};
