import { useFocusEffect } from "@react-navigation/core";
import { useCallback } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

/**
 * This hook disables gesture navigation and reenables it when the screen is unfocused
 */
export const useItwDisableGestureNavigation = () => {
  const navigation = useIONavigation();
  useFocusEffect(
    useCallback(() => {
      // Disable swipe when current screen is focused
      navigation.setOptions({ gestureEnabled: false });
      navigation.getParent()?.setOptions({ gestureEnabled: false });
      // Re-enable swipe after current screen is unfocused
      return () => {
        navigation.getParent()?.setOptions({ gestureEnabled: true });
      };
    }, [navigation])
  );
};
