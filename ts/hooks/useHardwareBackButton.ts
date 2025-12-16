/* eslint-disable functional/immutable-data */
import { BackHandler } from "react-native";
import { useCallback, useEffect, useRef } from "react";

/**
 * Custom hook to handle the hardware back button on Android devices
 * @param handler - a function that will be called when the user presses the back button.
 *  The function must return true if the back button must not be bubbled up, false otherwise.
 * See more: https://reactnative.dev/docs/backhandler
 */
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
