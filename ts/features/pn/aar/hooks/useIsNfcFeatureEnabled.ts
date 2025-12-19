import { useCallback, useState } from "react";
import cieSdk from "@pagopa/react-native-cie";
import { constNull } from "fp-ts/lib/function";
import { Platform } from "react-native";

export const useIsNfcFeatureEnabled = () => {
  const [isChecking, setIsChecking] = useState(false);

  const isNfcEnabled = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);

    return cieSdk
      .isNFCEnabled()
      .catch(() => false)
      .finally(() => {
        setIsChecking(false);
      });
  }, []);

  const openNFCSettings = useCallback(() => {
    if (Platform.OS === "android") {
      void cieSdk.openNFCSettings().catch(constNull);
    }
  }, []);

  return {
    isChecking,
    isNfcEnabled,
    openNFCSettings
  };
};
