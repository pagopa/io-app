import { Linking, Platform } from "react-native";
import AndroidOpenSettings from "react-native-android-open-settings";

export const openBluetoothPreferences = () => {
  if (Platform.OS === "ios") {
    Linking.openURL("App-Prefs:Bluetooth").catch(() => null);
  } else {
    AndroidOpenSettings.bluetoothSettings();
  }
};
