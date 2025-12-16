import { constUndefined } from "fp-ts/lib/function";
import { Linking, Platform } from "react-native";
import AndroidOpenSettings from "react-native-android-open-settings";

export const openAppSettings = () => {
  if (Platform.OS === "ios") {
    Linking.openURL("app-settings:").catch(constUndefined);
  } else {
    AndroidOpenSettings.appDetailsSettings();
  }
};
