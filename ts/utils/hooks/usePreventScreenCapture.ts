import { useEffect } from "react";
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
 * Hook that disables screen capture for as long as the component is mounted:
 * - On Android, it enables `FLAG_SECURE`
 * - On iOS, uses a hidden secure text field as the platform does not expose an API to disable screenshots
 *
 * @param key An optional key to prevent conflicts when using multiple instances of this hook at the same time.
 */
export function usePreventScreenCapture(key = "default") {
  useEffect(() => {
    preventScreenCapture(key);

    return () => {
      allowScreenCapture(key);
    };
  }, [key]);
}
