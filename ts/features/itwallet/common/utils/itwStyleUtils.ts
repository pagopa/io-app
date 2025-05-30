import { StatusBarStyle } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { HeaderSecondLevelHookProps } from "../../../../hooks/useHeaderSecondLevel";
import { getCredentialNameFromType } from "./itwCredentialUtils";
import { CredentialType } from "./itwMocksUtils";

export type CredentialTheme = {
  backgroundColor: string;
  textColor: string;
  statusBarStyle: StatusBarStyle;
};

export const getThemeColorByCredentialType = (
  credentialType: string,
  supportL3Design?: boolean
): CredentialTheme => {
  switch (credentialType) {
    case CredentialType.PID:
    default:
      return {
        backgroundColor: "#295699",
        textColor: "#032D5C",
        statusBarStyle: "light-content"
      };
    case CredentialType.DRIVING_LICENSE:
      return {
        backgroundColor: supportL3Design ? IOColors["blueIO-500"] : "#744C63",
        textColor: supportL3Design ? "#032D5C" : "#652035",
        statusBarStyle: "light-content"
      };
    case CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD:
      return {
        backgroundColor: "#B3DCF9",
        textColor: "#032D5C",
        statusBarStyle: "dark-content"
      };
    case CredentialType.EUROPEAN_DISABILITY_CARD:
      return {
        backgroundColor: "#315B76",
        textColor: "#17406F",
        statusBarStyle: "light-content"
      };
  }
};

export const getHeaderPropsByCredentialType = (
  credentialType: string,
  supportL3Design: boolean
): HeaderSecondLevelHookProps => {
  const { backgroundColor } = getThemeColorByCredentialType(
    credentialType,
    supportL3Design
  );

  switch (credentialType) {
    case CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD:
      return {
        title: getCredentialNameFromType(credentialType),
        supportRequest: true,
        variant: "neutral",
        backgroundColor
      };
    default:
      return {
        title: getCredentialNameFromType(credentialType),
        supportRequest: true,
        variant: "contrast",
        backgroundColor
      };
  }
};
