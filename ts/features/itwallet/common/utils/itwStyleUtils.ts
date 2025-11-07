import { StatusBarStyle } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { HeaderSecondLevelHookProps } from "../../../../hooks/useHeaderSecondLevel";
import { getCredentialNameFromType } from "./itwCredentialUtils";
import { CredentialType } from "./itwMocksUtils";
import { IT_WALLET_BG } from "./constants";

export type CredentialTheme = {
  backgroundColor: string;
  textColor: string;
  statusBarStyle: StatusBarStyle;
  variant?: HeaderSecondLevelHookProps["variant"];
};

export const getThemeColorByCredentialType = (
  credentialType: string,
  withL3Design?: boolean
): CredentialTheme => {
  switch (credentialType) {
    case CredentialType.PID:
    default:
      return {
        backgroundColor: withL3Design ? IT_WALLET_BG : "#295699",
        textColor: "#032D5C",
        statusBarStyle: "light-content",
        variant: withL3Design ? "neutral" : "contrast"
      };
    case CredentialType.DRIVING_LICENSE:
      return {
        backgroundColor: withL3Design ? IT_WALLET_BG : "#744C63",
        textColor: withL3Design ? "#032D5C" : "#652035",
        statusBarStyle: withL3Design ? "dark-content" : "light-content",
        variant: withL3Design ? "neutral" : "contrast"
      };
    case CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD:
      return {
        backgroundColor: "#B3DCF9",
        textColor: "#032D5C",
        statusBarStyle: "dark-content",
        variant: "neutral"
      };
    case CredentialType.EUROPEAN_DISABILITY_CARD:
      return {
        backgroundColor: "#315B76",
        textColor: "#17406F",
        statusBarStyle: "light-content"
      };
    case CredentialType.EDUCATION_DEGREE:
      return {
        backgroundColor: "#F2F1CE",
        textColor: IOColors.black,
        statusBarStyle: "dark-content",
        variant: "neutral"
      };
    case CredentialType.EDUCATION_ENROLLMENT:
      return {
        backgroundColor: "#E0F2CE",
        textColor: IOColors.black,
        statusBarStyle: "dark-content",
        variant: "neutral"
      };
    case CredentialType.RESIDENCY:
      return {
        backgroundColor: "#F2E4CE",
        textColor: IOColors.black,
        statusBarStyle: "dark-content",
        variant: "neutral"
      };
  }
};

export const getHeaderPropsByCredentialType = (
  credentialType: string,
  withL3Design: boolean
) => {
  const { backgroundColor, variant } = getThemeColorByCredentialType(
    credentialType,
    withL3Design
  );

  return {
    title: getCredentialNameFromType(credentialType, "", withL3Design),
    variant: variant ?? "contrast",
    backgroundColor
  };
};
