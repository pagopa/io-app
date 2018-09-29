import Instabug, { LocaleKey } from "instabug-reactnative";
import { processColor } from "react-native";

import { Option } from "fp-ts/lib/Option";
import { UserProfile } from "../../definitions/backend/UserProfile";
import { Locales } from "../../locales/locales";
import { instabugToken } from "../config";
import I18n from "../i18n";
import { IdentityProvider } from "../models/IdentityProvider";
import variables from "../theme/variables";

type InstabugLocales = { [k in Locales]: LocaleKey };

const instabugLocales: InstabugLocales = {
  en: Instabug.locale.english,
  it: Instabug.locale.italian
};

export const initialiseInstabug = () => {
  // Initialise Instabug for iOS. The Android initialisation is inside MainApplication.java
  Instabug.startWithToken(instabugToken, [Instabug.invocationEvent.none]);

  // Set primary color for iOS. The Android's counterpart is inside MainApplication.java
  Instabug.setPrimaryColor(processColor(variables.contentPrimaryBackground));

  Instabug.setColorTheme(Instabug.colorTheme.light);
  Instabug.setLocale(instabugLocales[I18n.currentLocale()]);
};

export const setInstabugProfileAttributes = (
  profile: UserProfile,
  maybeIdp: Option<IdentityProvider>
) => {
  Instabug.identifyUserWithEmail(
    profile.spid_email,
    `${profile.name} ${profile.family_name}`
  );

  Instabug.setUserAttribute("fiscalcode", profile.fiscal_code);

  maybeIdp.fold(undefined, (idp: IdentityProvider) =>
    Instabug.setUserAttribute("identityProvider", idp.entityID)
  );
};
