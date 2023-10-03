import { useIOExperimentalDesign } from "@pagopa/io-app-design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLayoutEffect } from "react";

/**
 * This hook is used to enable the experimental design system reading the value from AsyncStorage
 * remove this once the experimental design system is stable
 */
export const useStoredExperimentalDesign = () => {
  const { setExperimental } = useIOExperimentalDesign();

  useLayoutEffect(() => {
    AsyncStorage.getItem("isDesignSystemEnabled")
      .then(value => {
        setExperimental(JSON.parse(value ?? "false"));
      })
      .catch(() => {
        setExperimental(false);
      });
  }, [setExperimental]);
};
