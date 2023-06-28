import React from "react";
import { Platform } from "react-native";
import Torch from "react-native-torch";

export const useFlashlight = () => {
  const [isOn, setIsOn] = React.useState(false);

  // If Android, we need camera permission to toggle the torch
  const isCameraAllowed = React.useCallback(
    async () =>
      Platform.OS === "ios"
        ? true
        : await Torch.requestCameraPermission(
            "Camera Permissions", // dialog title
            "We require camera permissions to use the torch on the back of your phone." // dialog body
          ),
    []
  );

  /**
   * Toggles the flash light
   */
  const toggle = React.useCallback(async () => {
    const cameraAllowed = await isCameraAllowed();
    if (cameraAllowed) {
      Torch.switchState(!isOn);
      setIsOn(!isOn);
    }
  }, [isOn, setIsOn, isCameraAllowed]);

  return {
    isOn,
    toggle
  };
};
