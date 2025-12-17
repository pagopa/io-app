import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useRef } from "react";
import RNScreenshotPrevent from "react-native-screenshot-prevent";
import { v4 as uuidv4 } from "uuid";
import { isDevEnv } from "../environment";

const activeTags: Set<string> = new Set();

const preventScreenCapture = (tag: string) => {
  if (!activeTags.has(tag)) {
    activeTags.add(tag);
    RNScreenshotPrevent.enableSecureView();
  }
};

const allowScreenCapture = (tag: string) => {
  activeTags.delete(tag);
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
export function usePreventScreenCapture(key?: string) {
  const tag = useMemo(() => key || uuidv4().toString(), [key]);

  const timeoutRef = useRef<number>(undefined);

  useFocusEffect(
    useCallback(() => {
      if (isDevEnv) {
        return;
      }

      clearTimeout(timeoutRef.current);

      preventScreenCapture(tag);

      return () => {
        // Here we wait a little after the blur event for navigation transition animations.
        // eslint-disable-next-line functional/immutable-data
        timeoutRef.current = setTimeout(() => allowScreenCapture(tag), 500);
      };
    }, [tag])
  );
}
