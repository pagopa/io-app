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

    registerSuperProperties({ UI_LANGUAGE: language });
    getPeople()?.set({ UI_LANGUAGE: language });
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
