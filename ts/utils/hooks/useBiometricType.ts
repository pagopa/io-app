import * as React from "react";
import { BiometricsValidType } from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../store/hooks";
import { isFingerprintEnabledSelector } from "../../store/reducers/persistedPreferences";
import { getBiometricsType, isBiometricsValidType } from "../biometrics";

export const useBiometricType = () => {
  const isFingerprintEnabled = useIOSelector(isFingerprintEnabledSelector);

  const [biometricType, setBiometricType] = React.useState<
    BiometricsValidType | undefined
  >(undefined);
  React.useEffect(() => {
    if (isFingerprintEnabled) {
      getBiometricsType().then(
        biometricsType =>
          setBiometricType(
            isBiometricsValidType(biometricsType) ? biometricsType : undefined
          ),
        _ => 0
      );
    }
  }, [isFingerprintEnabled]);

  return { biometricType, isFingerprintEnabled };
};
