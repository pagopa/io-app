import { useIOExperimentalDesign } from "@pagopa/io-app-design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLayoutEffect } from "react";

export const DS_PERSISTENCE_KEY = "isDesignSystemEnabled";

/**
 * This hook is used to enable the experimental design system reading the value from AsyncStorage
 * remove this once the experimental design system is stable
 */
export const useStoredExperimentalDesign = () => {
  const { setExperimental } = useIOExperimentalDesign();

  useLayoutEffect(() => {
    AsyncStorage.getItem(DS_PERSISTENCE_KEY)
      .then(value => {
        setExperimental(JSON.parse(value ?? "false"));
      })
      .catch(() => {
        setExperimental(false);
      });
  }, [setExperimental]);
};
