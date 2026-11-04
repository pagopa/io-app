import { Locales } from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import { updateMixpanelUILanguage } from "../../../../mixpanelConfig/uiLanguage";
import { buildEventProperties } from "../../../../utils/analytics";

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
    "SETTINGS_PREFERENCES_UI_LANGUAGE_UPDATE",
    buildEventProperties("UX", "action", {
      previous_language: previousLanguage,
      current_language: currentLanguage
    })
  );
};
