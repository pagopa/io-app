import { IOColors } from "@io-app/design-system";
import Color from "color";
import { StatusBarStyle } from "react-native";

import { HeaderSecondLevelHookProps } from "../../../../hooks/useHeaderSecondLevel";
import { CredentialType } from "./itwMocksUtils";

export type CredentialTheme = {
  backgroundColor: string;
  statusBarStyle: StatusBarStyle;
  textColor: string;
  variant: HeaderSecondLevelHookProps["variant"];
};

type BaseCredentialColors = Pick<
  CredentialTheme,
  "backgroundColor" | "textColor"
>;

const DEFAULT_COLOR = {
  backgroundColor: "#295699",
  textColor: "#032D5C"
};

const legacyThemeColorsByCredentialType: Record<string, BaseCredentialColors> =
  {
    [CredentialType.DRIVING_LICENSE]: {
      backgroundColor: "#744C63",
      textColor: "#652035"
    },
    [CredentialType.EDUCATION_ATTENDANCE]: {
      backgroundColor: "#F2F1CE",
      textColor: IOColors.black
    },
    [CredentialType.EDUCATION_DEGREE]: {
      backgroundColor: "#F2F1CE",
      textColor: IOColors.black
    },
    [CredentialType.EDUCATION_DIPLOMA]: {
      backgroundColor: "#F2F1CE",
      textColor: IOColors.black
    },
    [CredentialType.EDUCATION_ENROLLMENT]: {
      backgroundColor: "#E0F2CE",
      textColor: IOColors.black
    },
    [CredentialType.EUROPEAN_DISABILITY_CARD]: {
      backgroundColor: "#315B76",
      textColor: "#17406F"
    },
    [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: {
      backgroundColor: "#B3DCF9",
      textColor: "#032D5C"
    },
    [CredentialType.RESIDENCY]: {
      backgroundColor: "#F2E4CE",
      textColor: IOColors.black
    },
    [CredentialType.PID]: {
      backgroundColor: "#295699",
      textColor: "#032D5C"
    }
  };

/**
 * Return color configuration form Documenti su IO credentials
 *
 * @deprecated For IT-Wallet use useCredentialCardConfig instead
 */
export const getLegacyThemeColorByCredentialType = (
  credentialType: string
): CredentialTheme => {
  const { backgroundColor, textColor } =
    legacyThemeColorsByCredentialType[credentialType] ?? DEFAULT_COLOR;
  const isDark = Color(backgroundColor).isDark();

  return {
    backgroundColor,
    textColor,
    statusBarStyle: isDark ? "light-content" : "dark-content",
    variant: isDark ? "contrast" : "neutral"
  };
};
