/* eslint-disable functional/immutable-data */
import { BackHandler } from "react-native";
import { useCallback, useEffect, useRef } from "react";

export const useHardwareBackButton = (handler: () => boolean) => {
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handler
    );

    return () => {
      subscription.remove();
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
  const isComponentOpened = useRef(false);

  useHardwareBackButton(() => {
    const isOpen = isComponentOpened.current;
    onDismiss();
    isComponentOpened.current = false;
    // true only if we handle the back
    return isOpen;
  });

  return {
    onOpen: useCallback(() => {
      isComponentOpened.current = true;
    }, []),
    onClose: useCallback(() => {
      isComponentOpened.current = false;
    }, [])
  };
};
