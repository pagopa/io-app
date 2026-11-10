import { Locales } from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import {
  updateMixpanelMessageLanguage,
  updateMixpanelUILanguage
} from "../../../../mixpanelConfig/uiLanguage";
import { buildEventProperties } from "../../../../utils/analytics";

export const trackLanguagePreferenceSelected = () => {
  void mixpanelTrack(
    "SETTINGS_PREFERENCES_LANGUAGE_SELECTED",
    buildEventProperties("UX", "action")
  );
};

export const trackPreferencesScreenView = () => {
  void mixpanelTrack(
    "SETTINGS_PREFERENCES",
    buildEventProperties("UX", "screen_view")
  );
};

export const trackUILanguageUpdate = (
  previousLanguage: Locales,
  currentLanguage: Locales
) => {
  if (
    previousLanguage === currentLanguage ||
    !updateMixpanelUILanguage(currentLanguage)
  ) {
    return;
  }

  void mixpanelTrack(
    "SETTINGS_PREFERENCES_LANGUAGE_UI_UPDATED",
    buildEventProperties("UX", "screen_view", {
      previous_language: previousLanguage,
      current_language: currentLanguage
    })
  );
};

export const trackMessageLanguageUpdate = (
  previousLanguage: Locales,
  currentLanguage: Locales
) => {
  if (
    previousLanguage === currentLanguage ||
    !updateMixpanelMessageLanguage(currentLanguage)
  ) {
    return;
  }

  void mixpanelTrack(
    "SETTINGS_PREFERENCES_LANGUAGE_MESSAGE_UPDATED",
    buildEventProperties("UX", "screen_view", {
      previous_language: previousLanguage,
      current_language: currentLanguage
    })
  );
};
