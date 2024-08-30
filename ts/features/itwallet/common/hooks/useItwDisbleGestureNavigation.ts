import React from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

/**
 * This hook disables gesture navigation and reenables it when the screen is unmounted
 */
export const useItwDisbleGestureNavigation = () => {
  const navigation = useIONavigation();
  React.useEffect(() => {
    // Disable swipe
    navigation.setOptions({ gestureEnabled: false });
    navigation.getParent()?.setOptions({ gestureEnabled: false });
    // Re-enable swipe after going back
    return () => {
      navigation.getParent()?.setOptions({ gestureEnabled: true });
    };
  }, [navigation]);
};
