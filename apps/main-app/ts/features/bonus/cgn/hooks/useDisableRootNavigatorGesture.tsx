import { useEffect } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

export const useDisableRootNavigatorGesture = (): void => {
  const navigation = useIONavigation();

  useEffect(() => {
    navigation.getParent()?.setOptions({ gestureEnabled: false });
    // Re-enable swipe after going back
    return () => {
      navigation.getParent()?.setOptions({ gestureEnabled: true });
    };
  }, [navigation]);
};
