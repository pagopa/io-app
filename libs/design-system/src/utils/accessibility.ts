import { isSwitchAccessEnabled } from "@io-app/expo-switch-access";
import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  AppState,
  Platform,
  useWindowDimensions
} from "react-native";

import { IOMaxFontSizeMultiplier } from "./fonts";

/**
 * Query whether a bold text is currently enabled. The result is true when bold
 * text is enabled and false otherwise.
 */
export const useBoldTextEnabled = () => {
  const [boldTextEnabled, setBoldTextEnabled] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") {
      const boldTextChangedSubscription = AccessibilityInfo.addEventListener(
        "boldTextChanged",
        isBoldTextEnabled => {
          setBoldTextEnabled(isBoldTextEnabled);
        }
      );

      AccessibilityInfo.isBoldTextEnabled()
        .then(isBoldTextEnabled => {
          setBoldTextEnabled(isBoldTextEnabled);
        })
        .catch(_ => false);

      return () => {
        boldTextChangedSubscription.remove();
      };
    }
    return;
  }, []);

  return boldTextEnabled;
};

export const useSwitchAccessEnabled = () => {
  const [switchAccessEnabled, setSwitchAccessEnabled] = useState(false);

  useEffect(() => {
    const updateSwitchAccessState = () =>
      void isSwitchAccessEnabled().then(setSwitchAccessEnabled);

    void updateSwitchAccessState();
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") {
        void updateSwitchAccessState();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return switchAccessEnabled;
};

export const useScreenReaderEnabled = () => {
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    const subscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      setScreenReaderEnabled
    );

    AccessibilityInfo.isScreenReaderEnabled()
      .then(setScreenReaderEnabled)
      .catch(_ => false);

    return () => {
      subscription.remove();
    };
  }, []);

  return screenReaderEnabled;
};

/**
 * Returns a font size multiplier based on the font scale of the device, but
 * limited to the `IOMaxFontSizeMultiplier` value.
 *
 * @returns Number
 */
export const useIOFontDynamicScale = (): {
  dynamicFontScale: number;
  hugeFontEnabled: boolean;
  spacingScaleMultiplier: number;
} => {
  const { fontScale } = useWindowDimensions();

  const hugeFontEnabled = fontScale >= 1.35;

  const dynamicFontScale = Math.min(fontScale, IOMaxFontSizeMultiplier);
  /* We make the spacing dynamic based on the font scale, but we multiply
    this value to limit the amount of scaling applied to the spacing */
  const spacingScaleMultiplier =
    dynamicFontScale <= IOMaxFontSizeMultiplier ? 1 : 0.8;

  return {
    hugeFontEnabled,
    dynamicFontScale,
    spacingScaleMultiplier
  };
};
