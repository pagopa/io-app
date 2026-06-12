import { useIONewTypeface } from "@pagopa/io-app-design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLayoutEffect } from "react";

export const FONT_PERSISTENCE_KEY = "fontTypeface";

/**
 * This hook is used to enable the experimental design system reading the value from AsyncStorage
 * remove this once the experimental design system is stable
 */
export const useStoredFontPreference = () => {
  const { setNewTypefaceEnabled } = useIONewTypeface();

  useLayoutEffect(() => {
    AsyncStorage.getItem(FONT_PERSISTENCE_KEY)
      .then(value => {
        setNewTypefaceEnabled(value ? value === "comfortable" : true);
      })
      .catch(() => {
        setNewTypefaceEnabled(true);
      });
  }, [setNewTypefaceEnabled]);
};
