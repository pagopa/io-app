import { Option } from "fp-ts/lib/Option";
import Instabug, { Chats } from "instabug-reactnative";

import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import { Locales } from "../../locales/locales";
import { instabugToken } from "../config";
import I18n from "../i18n";
import { IdentityProvider } from "../models/IdentityProvider";
import { getProfileEmail } from "../store/reducers/profile";
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

export const initialiseInstabug = () => {
  // Initialise Instabug for iOS. The Android initialisation is inside MainApplication.java
  Instabug.startWithToken(instabugToken, [Instabug.invocationEvent.none]);
  Chats.setEnabled(true);
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
  profile: InitializedProfile,
  maybeIdp: Option<IdentityProvider>
) => {
  getProfileEmail(profile).map(email => {
    Instabug.identifyUserWithEmail(
      email,
      `${profile.name} ${profile.family_name}`
    );
  });

  setInstabugUserAttribute("fiscalcode", profile.fiscal_code);
  maybeIdp.fold(undefined, (idp: IdentityProvider) =>
    setInstabugUserAttribute("identityProvider", idp.entityID)
  );
};
