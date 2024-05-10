import { Linking, Platform } from "react-native";
import AndroidOpenSettings from "react-native-android-open-settings";

export const openAppSettings = () => {
  if (Platform.OS === "ios") {
    Linking.openURL("app-settings:").catch(_ => undefined);
  } else {
    AndroidOpenSettings.appDetailsSettings();
  }
};

export const openAppSecuritySettings = () => {
  if (Platform.OS === "ios") {
    Linking.openURL("App-prefs:root=General").catch(_ => undefined);
  } else {
    AndroidOpenSettings.securitySettings();
  }
};
