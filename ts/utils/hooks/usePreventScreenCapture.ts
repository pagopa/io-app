import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";
import RNScreenshotPrevent from "react-native-screenshot-prevent";

const activeTags: Set<string> = new Set();

const preventScreenCapture = (key: string) => {
  if (!activeTags.has(key)) {
    activeTags.add(key);
    RNScreenshotPrevent.enableSecureView();
  }
};

const allowScreenCapture = (key: string) => {
  activeTags.delete(key);
  if (activeTags.size === 0) {
    RNScreenshotPrevent.disableSecureView();
  }
};

/**
 * Hook that disables screen capture for as long as the component is focused.
 *
 * In a stack navigator unfocused screens are not unmounted, so the `useEffect` cleanup function is not called.
 *
 * The native library implementation is the following:
 * - On Android, it enables `FLAG_SECURE`
 * - On iOS, uses a hidden secure text field as the platform does not expose an API to disable screenshots
 *
 * @param key An optional key to prevent conflicts when using multiple instances of this hook at the same time.
 */
export function usePreventScreenCapture(key = "default") {
  const timeoutRef = useRef<number>();

  useFocusEffect(
    useCallback(() => {
      clearTimeout(timeoutRef.current);

      preventScreenCapture(key);

      return () => {
        // Here we wait a little after the blur event for navigation transition animations.
        // eslint-disable-next-line functional/immutable-data
        timeoutRef.current = setTimeout(() => allowScreenCapture(key), 500);
      };
    }, [key])
  );
}
