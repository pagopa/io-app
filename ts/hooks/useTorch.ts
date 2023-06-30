import React from "react";
import { Platform } from "react-native";
import Torch from "react-native-torch";
import I18n from "../i18n";

/**
 * Allows the usage of the torch on the back of the phone-
 * On Android, it requires camera permissions.
 */
export const useTorch = () => {
  const [isOn, setIsOn] = React.useState(false);

  // If Android, we need camera permission to toggle the torch
  const requestCameraPermission = React.useCallback(
    async () =>
      Platform.OS === "ios"
        ? true
        : await Torch.requestCameraPermission(
            I18n.t("permissionRationale.flashlight.title"),
            I18n.t("permissionRationale.flashlight.message")
          ),
    []
  );

  const turnOff = React.useCallback(() => {
    if (isOn) {
      Torch.switchState(false);
      setIsOn(false);
    }
  }, [isOn]);

  /**
   * Make sure to turn off the torch on unmount
   */
  React.useEffect(() => turnOff, [turnOff]);

  /**
   * Toggles the torch
   */
  const toggle = async () => {
    const hasCameraPermission = await requestCameraPermission();
    if (hasCameraPermission) {
      Torch.switchState(!isOn);
      setIsOn(!isOn);
    }
  };

  return {
    isOn,
    toggle
  };
};
