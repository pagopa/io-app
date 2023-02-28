import React, { useCallback } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

export function useTabItemPressWhenScreenActive(
  callback: () => void,
  hasInternTab: boolean
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

      if (hasInternTab) {
        // eslint-disable-next-line
        // @ts-ignore
        navigation.getParent()?.addListener("tabPress", onTabPress);
      }

      return () => {
        // eslint-disable-next-line
        // @ts-ignore
        navigation.removeListener("tabPress", onTabPress);

        if (hasInternTab) {
          // eslint-disable-next-line
          // @ts-ignore
          navigation.getParent()?.removeListener("tabPress", onTabPress);
        }
      };
    }, [hasInternTab, navigation, onTabPress])
  );
}

export function withUseTabItemPressWhenScreenActive<P>(
  WrappedComponent: React.ComponentType<P>,
  callback: () => void,
  hasInternTab: boolean
) {
  return (props: any) => {
    useTabItemPressWhenScreenActive(callback, hasInternTab);
    return <WrappedComponent {...props} />;
  };
}
