import { CieUtils } from "@io-app/expo-cie";
import { useEffect, useState } from "react";

export const useIsNfcFeatureAvailable = () => {
  const [isNfcAvailable, setIsNfcAvailable] = useState<boolean | undefined>(
    undefined
  );

  const checkNfcAvailability = () => {
    CieUtils.hasNfcFeature()
      .then(isAvailable => {
        setIsNfcAvailable(isAvailable);
      })
      .catch(() => {
        setIsNfcAvailable(false);
      });
  };

  useEffect(() => {
    if (isNfcAvailable === undefined) {
      checkNfcAvailability();
    }
  }, [isNfcAvailable]);

  return isNfcAvailable;
};
