import React, { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

export type TabBarItemPressType = {
  setTabPressCallback: React.Dispatch<React.SetStateAction<() => void>>;
  setHasInternTab: React.Dispatch<React.SetStateAction<boolean>>;
};

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
  WrappedComponent: React.ComponentType<P>
) {
  return (props: any) => {
    const [callback, setTabPressCallback] = useState<() => void>(() => void 0);
    const [hasInternTab, setHasInternTab] = useState(false);

    const contextProps = {
      setTabPressCallback,
      setHasInternTab
    };

    useTabItemPressWhenScreenActive(callback, hasInternTab);

    return <WrappedComponent {...contextProps} {...props} />;
  };
}
