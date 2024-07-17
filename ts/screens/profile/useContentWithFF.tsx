import { useCallback } from "react";
import _ from "lodash";
import { TranslationKeys } from "../../../locales/locales";
import I18n from "../../i18n";
import { useIOSelector } from "../../store/hooks";
import { isSettingsVisibleAndHideProfileSelector } from "../../store/reducers/backendStatus";

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
