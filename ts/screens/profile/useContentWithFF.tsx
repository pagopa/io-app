import { useCallback } from "react";
import _ from "lodash";
import { TranslationKeys } from "../../../locales/locales";
import I18n from "../../i18n";
import { useIOSelector } from "../../store/hooks";
import { isSettingsVisibleAndHideProfileSelector } from "../../store/reducers/backendStatus";

const useContentWithFF = (i18nString: TranslationKeys) => {
  const isSettingsVisibleAndHideProfile = useIOSelector(
    isSettingsVisibleAndHideProfileSelector,
    _.isEqual
  );

  const getContentWithFF = useCallback(
    (i18nString: TranslationKeys, selector: boolean) =>
      I18n.t(i18nString, {
        pageName: selector
          ? I18n.t("global.buttons.settings")
          : I18n.t("navigation.profile")
      }),
    []
  );

  return getContentWithFF(i18nString, isSettingsVisibleAndHideProfile);
};

export default useContentWithFF;
