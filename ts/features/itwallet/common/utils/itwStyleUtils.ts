import { IOColors } from "@pagopa/io-app-design-system";
import { StatusBarStyle } from "react-native";
import { useMemo } from "react";
import { HeaderSecondLevelHookProps } from "../../../../hooks/useHeaderSecondLevel";
import { getLuminance } from "../../../../utils/color";
import { getCredentialNameFromType } from "./itwCredentialUtils";
import { CredentialType } from "./itwMocksUtils";
import { useItWalletTheme } from "./theme";

export type CredentialTheme = {
  backgroundColor: string;
  textColor: string;
  statusBarStyle: StatusBarStyle;
  variant: HeaderSecondLevelHookProps["variant"];
};

export const useThemeColorByCredentialType = (
  credentialType: string,
  withL3Design?: boolean
): CredentialTheme => {
  const theme = useItWalletTheme();

  const colors = useMemo(() => {
    switch (credentialType) {
      case CredentialType.PID:
      default:
        return {
          backgroundColor: withL3Design
            ? theme["header-background"]
            : "#295699",
          textColor: "#032D5C"
        };
      case CredentialType.DRIVING_LICENSE:
        return {
          backgroundColor: withL3Design
            ? theme["header-background"]
            : "#744C63",
          textColor: withL3Design ? "#032D5C" : "#652035"
        };
      case CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD:
        return {
          backgroundColor: "#B3DCF9",
          textColor: "#032D5C"
        };
      case CredentialType.EUROPEAN_DISABILITY_CARD:
        return {
          backgroundColor: "#315B76",
          textColor: "#17406F"
        };
      case CredentialType.EDUCATION_DEGREE:
        return {
          backgroundColor: "#F2F1CE",
          textColor: IOColors.black
        };
      case CredentialType.EDUCATION_ENROLLMENT:
        return {
          backgroundColor: "#E0F2CE",
          textColor: IOColors.black
        };
      case CredentialType.RESIDENCY:
        return {
          backgroundColor: "#F2E4CE",
          textColor: IOColors.black
        };
    }
  }, [credentialType, theme, withL3Design]);

  const isDarker = getLuminance(colors.backgroundColor) < 0.5;

  return {
    ...colors,
    // Return appropriate status bar style and header variant based on background color luminance
    statusBarStyle: isDarker ? "light-content" : "dark-content",
    variant: isDarker ? "contrast" : "neutral"
  };
};

export const useHeaderPropsByCredentialType = (
  credentialType: string,
  withL3Design: boolean
) => {
  const { backgroundColor, variant } = useThemeColorByCredentialType(
    credentialType,
    withL3Design
  );

  return {
    title: getCredentialNameFromType(credentialType, "", withL3Design),
    variant,
    backgroundColor
  };
};
