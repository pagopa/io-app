import { useEffect } from "react";
import { BackHandler } from "react-native";

export const useHardwareBackButton = (handler: () => boolean) => {
  useEffect(
    () => {
      BackHandler.addEventListener("hardwareBackPress", handler);

      return () => {
        BackHandler.removeEventListener("hardwareBackPress", handler);
      };
    },
    [handler]
  );
};
