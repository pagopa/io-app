/* eslint-disable functional/immutable-data */
import { TextInputValidationRefProps } from "@pagopa/io-app-design-system";
import { useIsFocused } from "@react-navigation/native";
import { RefObject, useEffect, useRef } from "react";
import { TextInput } from "react-native";

/**
 * Hook to automatically focus an input when the screen becomes focused for the first time.
 * Resets when the screen loses focus, so it will focus again on subsequent visits.
 *
 * @param inputRef - Ref to the input component that may have a `focus()` method
 * @param delayMs - Optional delay before focusing (default: 500ms)
 * @param canAutoFocus - Optional flag to enable or disable autofocus (default: true)
 */
const useInputFocus = (
  inputRef: RefObject<TextInput | TextInputValidationRefProps | null>,
  delayMs: number = 500,
  canAutoFocus: boolean = true
) => {
  const hasFocused = useRef(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && !hasFocused.current && canAutoFocus) {
      // Small delay to let the native view hierarchy catch up
      const timer = setTimeout(() => {
        if (inputRef.current && !hasFocused.current) {
          // Check if the ref has a focus method before calling it
          if (
            "focus" in inputRef.current &&
            typeof inputRef.current.focus === "function"
          ) {
            inputRef.current.focus();
          }
          hasFocused.current = true;
        }
      }, delayMs);
      return () => clearTimeout(timer);
    }

    // Reset the lock when leaving the screen
    if (!isFocused) {
      hasFocused.current = false;
    }

    return undefined;
  }, [isFocused, inputRef, delayMs, canAutoFocus]);
};

export { useInputFocus };
