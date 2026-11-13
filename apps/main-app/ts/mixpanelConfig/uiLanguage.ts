import { Locales } from "../i18n";
import {
  getPeople,
  isMixpanelInstanceInitialized,
  registerSuperProperties
} from "../mixpanel";
import { trackAppCaughtError } from "../utils/analytics";
import { unknownToString } from "../utils/errors";

export const updateMixpanelUILanguage = (language: Locales): boolean => {
  try {
    if (!isMixpanelInstanceInitialized()) {
      return false;
    }

    registerSuperProperties({ LANGUAGE_UI: language });
    getPeople()?.set({ PROFILE_LANGUAGE_UI: language });
    return true;
  } catch (error) {
    trackAppCaughtError(
      "updateMixpanelUILanguage",
      undefined,
      unknownToString(error)
    );
    return false;
  }
};

export const updateMixpanelMessageLanguage = (language: Locales): boolean => {
  try {
    if (!isMixpanelInstanceInitialized()) {
      return false;
    }

    registerSuperProperties({ LANGUAGE_MESSAGE: language });
    getPeople()?.set({ PROFILE_LANGUAGE_MESSAGE: language });
    return true;
  } catch (error) {
    trackAppCaughtError(
      "updateMixpanelMessageLanguage",
      undefined,
      unknownToString(error)
    );
    return false;
  }
};
