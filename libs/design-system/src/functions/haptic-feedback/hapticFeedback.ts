import {
  HapticFeedbackTypes,
  HapticOptions,
  trigger
} from "react-native-haptic-feedback";

const defaultOptions: HapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false
};

const triggerHaptic = (
  type: HapticFeedbackTypes | keyof typeof HapticFeedbackTypes,
  options?: HapticOptions
) => trigger(type, { ...defaultOptions, ...options });

export { HapticFeedbackTypes as HapticTypes, triggerHaptic };
export type { HapticOptions };
