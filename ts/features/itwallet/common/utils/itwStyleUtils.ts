import { IOColors } from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import { StatusBarStyle } from "react-native";
import { HeaderSecondLevelHookProps } from "../../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../../store/hooks";
import { getLuminance } from "../../../../utils/color";
import {
  credentialBackgroundColors,
  credentialTitleColors
} from "../components/ItwCredentialCard/CardBackground";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { getCredentialNameFromType } from "./itwCredentialUtils";
import { CredentialType } from "./itwMocksUtils";
import { useItWalletTheme } from "./theme";

export type CredentialTheme = {
  backgroundColor: string;
  textColor: string;
  statusBarStyle: StatusBarStyle;
  variant: HeaderSecondLevelHookProps["variant"];
};

type BaseCredentialColors = Pick<
  CredentialTheme,
  "backgroundColor" | "textColor"
>;

const getLegacyThemeColorByCredentialType = (
  credentialType: string
): BaseCredentialColors => {
  switch (credentialType) {
    case CredentialType.DRIVING_LICENSE:
      return {
        backgroundColor: "#744C63",
        textColor: "#652035"
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
    case CredentialType.PID:
    default:
      return {
        backgroundColor: "#295699",
        textColor: "#032D5C"
      };
  }
};

export const getThemeColorByCredentialType = (
  credentialType: string,
  withL3Design: boolean,
  themedBackgroundColor: string
): CredentialTheme => {
  const colors = withL3Design
    ? {
        backgroundColor:
          credentialBackgroundColors[credentialType] ?? themedBackgroundColor,
        textColor: credentialTitleColors[credentialType] ?? IOColors.black
      }
    : getLegacyThemeColorByCredentialType(credentialType);

  const isDarker = getLuminance(colors.backgroundColor) < 0.5;

  return {
    ...colors,
    statusBarStyle: isDarker ? "light-content" : "dark-content",
    variant: isDarker ? "contrast" : "neutral"
  };
};

export const useThemeColorByCredentialType = (
  credentialType: string
): CredentialTheme => {
  const theme = useItWalletTheme();
  const withL3Design = useIOSelector(itwLifecycleIsITWalletValidSelector);

  return useMemo(
    () =>
      getThemeColorByCredentialType(
        credentialType,
        withL3Design,
        theme["header-background"]
      ),
    [credentialType, theme, withL3Design]
  );
};

export const useHeaderPropsByCredentialType = (credentialType: string) => {
  const { backgroundColor, variant } =
    useThemeColorByCredentialType(credentialType);
  const withL3Design = useIOSelector(itwLifecycleIsITWalletValidSelector);

  return {
    title: getCredentialNameFromType(credentialType, "", withL3Design),
    variant,
    backgroundColor
  };
};
