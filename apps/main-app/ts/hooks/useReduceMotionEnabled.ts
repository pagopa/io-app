import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** Returns the current system reduce-motion preference and tracks live changes. */
export const useReduceMotionEnabled = (): boolean => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(true);
  const isMounted = useRef(false);
  const receivedChange = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      isEnabled => {
        if (!isMounted.current) {
          return;
        }
        receivedChange.current = true;
        setReduceMotionEnabled(isEnabled);
      }
    );

    void AccessibilityInfo.isReduceMotionEnabled().then(isEnabled => {
      if (isMounted.current && !receivedChange.current) {
        setReduceMotionEnabled(isEnabled);
      }
    });

    return () => {
      isMounted.current = false;
      subscription.remove();
    };
  }, []);

  return reduceMotionEnabled;
};
