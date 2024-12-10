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
      /* tabPress is not present in typed events in the library,
      so we need to add the `eslint-disable-next-line` comment */

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      navigation.addListener("tabPress", onTabPress);

      if (hasInternalTab) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        navigation.getParent()?.addListener("tabPress", onTabPress);
      }

      return () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        navigation.removeListener("tabPress", onTabPress);

        if (hasInternalTab) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          navigation.getParent()?.removeListener("tabPress", onTabPress);
        }
      };
    }, [hasInternalTab, navigation, onTabPress])
  );
}
