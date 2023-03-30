import { useCallback } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

export function useTabItemPressWhenScreenActive(
  callback: () => void,
  hasInternalTab: boolean
) {
  const navigation = useNavigation();
  const onTabPress = useCallback(() => {
    if (navigation.isFocused()) {
      callback();
    }
  }, [navigation, callback]);

  useFocusEffect(
    useCallback(() => {
      // tabPress is not present in typed events in the library

      // eslint-disable-next-line
      // @ts-ignore
      navigation.addListener("tabPress", onTabPress);

      if (hasInternalTab) {
        // eslint-disable-next-line
        // @ts-ignore
        navigation.getParent()?.addListener("tabPress", onTabPress);
      }

      return () => {
        // eslint-disable-next-line
        // @ts-ignore
        navigation.removeListener("tabPress", onTabPress);

        if (hasInternalTab) {
          // eslint-disable-next-line
          // @ts-ignore
          navigation.getParent()?.removeListener("tabPress", onTabPress);
        }
      };
    }, [hasInternalTab, navigation, onTabPress])
  );
}
