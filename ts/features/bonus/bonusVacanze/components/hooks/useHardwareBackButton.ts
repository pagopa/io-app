import { useEffect } from "react";
import { BackHandler } from "react-native";
import * as React from "react";

export const useHardwareBackButton = (handler: () => boolean) => {
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handler);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handler);
    };
  }, [handler]);
};

/**
 * custom hook to handle the hardware back button on Android devices
 * - when the component is opened, back button closes the component
 * - when the component is closed, back button event is forwarded to the next handler
 * @param onDismiss: function called when the component is closed
 * @return a function to call when the component is opened
 */
export const useHardwareBackButtonToDismiss = (onDismiss: () => void) => {
  const [isComponentOpened, setIsComponentOpened] = React.useState(false);
  useHardwareBackButton(() => {
    const isOpen = isComponentOpened;
    onDismiss();
    setIsComponentOpened(false);
    // true only if we handle the back
    return isOpen;
  });
  return () => setIsComponentOpened(true);
};
