import { useCallback, useState } from "react";
import * as cieUtils from "../../../authentication/login/cie/utils/cie";

export const useIsNfcFeatureEnabled = () => {
  const [isChecking, setIsChecking] = useState(false);

  const isNfcEnabled = useCallback(async () => {
    setIsChecking(true);

    return cieUtils
      .isNfcEnabled()
      .then(res => res)
      .finally(() => {
        setIsChecking(false);
      });
  }, []);

  return {
    isChecking,
    isNfcEnabled,
    openNFCSettings: cieUtils.openNFCSettings
  };
};
