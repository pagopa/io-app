import { IOColors, useIOThemeContext } from "@io-app/design-system";
import Color from "color";
import { useMemo } from "react";
import { ColorSchemeName, StatusBarStyle } from "react-native";
import { HeaderSecondLevelHookProps } from "../../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../../store/hooks";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { getCredentialCardConfig } from "../components/ItwCredentialCard/config";
import { useItwCredentialName } from "../hooks/useItwCredentialName";
import { CredentialType } from "./itwMocksUtils";

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
    case CredentialType.EDUCATION_DIPLOMA:
    case CredentialType.EDUCATION_ATTENDANCE:
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
  colorScheme: ColorSchemeName
): CredentialTheme => {
  const cardConfig = getCredentialCardConfig(credentialType, colorScheme);
  const colors =
    withL3Design && cardConfig
      ? {
          backgroundColor: cardConfig.color,
          textColor: cardConfig.titleColor
        }
      : getLegacyThemeColorByCredentialType(credentialType);

  const isDark = Color(colors.backgroundColor).isDark();

  return {
    ...colors,
    statusBarStyle: isDark ? "light-content" : "dark-content",
    variant: isDark ? "contrast" : "neutral"
  };
};

export const useThemeColorByCredentialType = (
  credentialType: string
): CredentialTheme => {
  const { themeType } = useIOThemeContext();
  const withL3Design = useIOSelector(itwLifecycleIsITWalletValidSelector);

  return useMemo(
    () =>
      getThemeColorByCredentialType(credentialType, withL3Design, themeType),
    [credentialType, withL3Design, themeType]
  );
};

export const useHeaderPropsByCredentialType = (credentialType: string) => {
  const { backgroundColor, variant } =
    useThemeColorByCredentialType(credentialType);
  const title = useItwCredentialName(credentialType);

  return {
    title,
    variant,
    backgroundColor
  };
};
