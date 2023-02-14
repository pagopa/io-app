import React from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";

export function tabItemPressWhenScreenActive(
  callback: () => void,
  isTabNavigatorInParent: boolean
) {
  const navigation = useNavigation();

  const onTabPress = () => {
    
    if (navigation.isFocused()) {
      callback();
    }
  };

  useFocusEffect(
    useCallback(() => {
     
      //tabPress is not present in typed events in the library
      if (isTabNavigatorInParent) {
        //@ts-ignore
        navigation.getParent()?.addListener("tabPress", onTabPress);
      } else {
        //@ts-ignore
        navigation.addListener("tabPress", onTabPress);
      }

      return () => {
        if (isTabNavigatorInParent) {
          //@ts-ignore
          navigation.getParent()?.removeListener("tabPress", onTabPress);
        } else {
          //@ts-ignore
          navigation.removeListener("tabPress", onTabPress);
        }
      };
    }, [() => navigation.isFocused()])
  );
}

export function withTabItemPressWhenScreenActive<P>(
  WrappedComponent: React.ComponentType<P>,
  callback: () => void,
  isTabNavigatorInParent: boolean
) {
  return (props: any) => {
    tabItemPressWhenScreenActive(callback, isTabNavigatorInParent);
    return <WrappedComponent {...props} />;
  };
}
