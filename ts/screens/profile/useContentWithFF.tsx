import { useCallback } from "react";
import _ from "lodash";
import { TranslationKeys } from "../../../locales/locales";
import I18n from "../../i18n";
import { useIOSelector } from "../../store/hooks";
import { isSettingsVisibleAndHideProfileSelector } from "../../store/reducers/backendStatus";

/**
 *
 * @param i18nString is the translation string that contains a placeholder (pageName)
 * @returns a string in which the placeholder (pageName) is replaced according to the value of the selector
 * @notes when the selector isSettingsVisibleAndHideProfileSelector will be deleted, this custom hook
 * will also be deleted and the placeholder pageName in the translation files will have to be replaced
 * with the value of the transation string "global.buttons.settings"
 */

const useContentWithFF = (i18nString: TranslationKeys) => {
  const isSettingsVisibleAndHideProfile = useIOSelector(
    isSettingsVisibleAndHideProfileSelector
  );

  const getContentWithFF = useCallback(
    (isSettingsVisible: boolean) =>
      I18n.t(i18nString, {
        pageName: isSettingsVisible
          ? I18n.t("global.buttons.settings")
          : I18n.t("navigation.profile")
      }),
    [i18nString]
  );

  return getContentWithFF(isSettingsVisibleAndHideProfile);
};

export default useContentWithFF;
