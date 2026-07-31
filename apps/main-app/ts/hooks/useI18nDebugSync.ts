import I18n from "i18next";
import { useEffect } from "react";

import { setI18nDebugMode } from "../components/debug/i18nDebugPostProcessor";
import { useIOSelector } from "../store/hooks";
import { isI18nDebugEnabledSelector } from "../store/reducers/debug";

/**
 * Syncs the Redux-persisted `isI18nDebugEnabled` preference with the
 * module-level flag read by the i18next post-processor.
 *
 * Also triggers a forced language-change event so components using
 * `useTranslation()` re-render immediately after the toggle. Components
 * using `I18n.t()` directly will show updated output on the next
 * navigation (i.e. when the screen remounts).
 *
 * Must be called from a component that sits inside `<Provider>` but above
 * the navigator — `RootContainerFC` is the right place.
 */
export const useI18nDebugSync = () => {
  const isI18nDebugEnabled = useIOSelector(isI18nDebugEnabledSelector);

  useEffect(() => {
    setI18nDebugMode(isI18nDebugEnabled);
    // Force react-i18next subscribers to re-render with the updated output.
    void I18n.changeLanguage(I18n.language);
  }, [isI18nDebugEnabled]);
};
