import { StatusBarStyle } from "react-native";
import { HeaderSecondLevelHookProps } from "../../../../hooks/useHeaderSecondLevel";
import { getCredentialNameFromType } from "./itwCredentialUtils";
import { CredentialType } from "./itwMocksUtils";
import { itwIsL3EnabledSelector } from "../store/selectors/preferences";
import { useIOSelector } from "../../../../store/hooks";

export type CredentialTheme = {
  backgroundColor: string;
  textColor: string;
  statusBarStyle: StatusBarStyle;
};

export const getThemeColorByCredentialType = (
  credentialType: string,
  isL3Enabled: boolean
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
      if (isL3Enabled) {
        return {
          backgroundColor: "#0B3EE3",
          textColor: "#032D5C",
          statusBarStyle: "light-content"
        };
      } else {
        return {
          backgroundColor: "#744C63",
          textColor: "#652035",
          statusBarStyle: "light-content"
        };
      }
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
  isL3Enabled: boolean
): HeaderSecondLevelHookProps => {
  const { backgroundColor } = getThemeColorByCredentialType(
    credentialType,
    isL3Enabled
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
