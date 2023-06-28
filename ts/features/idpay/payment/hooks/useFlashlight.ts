import React from "react";
import { Platform } from "react-native";
import Torch from "react-native-torch";

export const useFlashlight = () => {
  const [isFlashlightOn, setFlashlightOn] = React.useState(false);

  /**
   * Toggles the flash light
   */
  const toggleFlashLight = React.useCallback(async () => {
    // If Android, we need camera permission to toggle the torch
    if (Platform.OS === "ios") {
      Torch.switchState(!isFlashlightOn);
      setFlashlightOn(!isFlashlightOn);
    } else {
      const cameraAllowed = await Torch.requestCameraPermission(
        "Camera Permissions", // dialog title
        "We require camera permissions to use the torch on the back of your phone." // dialog body
      );

      if (cameraAllowed) {
        Torch.switchState(!isFlashlightOn);
        setFlashlightOn(!isFlashlightOn);
      }
    }
  }, [isFlashlightOn, setFlashlightOn]);

  return {
    isFlashlightOn,
    toggleFlashLight
  };
};
