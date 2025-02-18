import { StatusBarProps, StatusBarStyle } from "react-native";
import { HeaderSecondLevelHookProps } from "../../../../hooks/useHeaderSecondLevel";
import { getCredentialNameFromType } from "./itwCredentialUtils";
import { CredentialType } from "./itwMocksUtils";

export type CredentialTheme = {
  backgroundColor: string;
  textColor: string;
  statusBarStyle: StatusBarStyle;
};

export const getThemeColorByCredentialType = (
  credentialType: string
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
        backgroundColor: "#744C63",
        textColor: "#652035",
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
  credentialType: string
): HeaderSecondLevelHookProps => {
  const { backgroundColor } = getThemeColorByCredentialType(credentialType);

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

export const getStatusBarPropsByCredentialType = (
  credentialType: string
): StatusBarProps => {
  const { backgroundColor } = getThemeColorByCredentialType(credentialType);

  switch (credentialType) {
    case CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD:
      return {
        backgroundColor,
        barStyle: "dark-content"
      };
    default:
      return {
        backgroundColor,
        barStyle: "light-content"
      };
  }
};
