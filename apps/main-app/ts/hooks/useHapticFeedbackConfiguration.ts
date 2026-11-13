import { isHapticFeedbackEnabled } from "@io-app/expo-device-internal";
import { Platform } from "react-native";
import { Settings } from "react-native-pulsar";

import { useAppStateActive } from "./useAppStateActive";

const syncHapticFeedback = () => {
  if (Platform.OS === "android") {
    Settings.enableHaptics(isHapticFeedbackEnabled());
  }
};

export const useHapticFeedbackConfiguration = () => {
  useAppStateActive(syncHapticFeedback);
};
