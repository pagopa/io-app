import {
  trigger,
  HapticFeedbackTypes,
  HapticOptions
} from "react-native-haptic-feedback";

const defaultOptions: HapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false
};

const triggerHaptic = (
  type: HapticFeedbackTypes | keyof typeof HapticFeedbackTypes,
  options?: HapticOptions
) => trigger(type, { ...defaultOptions, ...options });

export { triggerHaptic, HapticFeedbackTypes as HapticTypes };
export type { HapticOptions };
