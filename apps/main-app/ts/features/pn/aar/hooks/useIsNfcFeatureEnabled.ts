import { CieUtils } from "@io-app/expo-cie";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

export const useIsNfcFeatureEnabled = () => {
  const [isChecking, setIsChecking] = useState(false);

  const isNfcEnabled = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      setIsChecking(true);

      return CieUtils.isNfcEnabled()
        .catch(() => false)
        .finally(() => {
          setIsChecking(false);
        });
    }

    return Promise.resolve(true);
  }, []);

  const openNFCSettings = useCallback(() => {
    if (Platform.OS === "android") {
      void CieUtils.openNfcSettings().catch(() => undefined);
    }
  }, []);

  return {
    isChecking,
    isNfcEnabled,
    openNFCSettings
  };
};
