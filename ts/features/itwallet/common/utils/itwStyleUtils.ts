import { IOColors } from "@pagopa/io-app-design-system";
import { HeaderSecondLevelHookProps } from "../../../../hooks/useHeaderSecondLevel";
import { CredentialType } from "./itwMocksUtils";

export const getThemeColorByCredentialType = (credentialType: string) => {
  switch (credentialType) {
    case CredentialType.PID:
      return IOColors["blueItalia-600"];
    case CredentialType.DRIVING_LICENSE:
      return IOColors.antiqueFuchsia;
    case CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD:
      return "#B3DCF9";
    default:
      return IOColors["blueItalia-850"];
  }
};

export const getHeaderPropsByCredentialType = (
  credentialType: string
): HeaderSecondLevelHookProps => {
  switch (credentialType) {
    case CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD:
      return {
        title: "",
        supportRequest: true,
        variant: "neutral",
        backgroundColor: getThemeColorByCredentialType(credentialType)
      };
    default:
      return {
        title: "",
        supportRequest: true,
        variant: "contrast",
        backgroundColor: getThemeColorByCredentialType(credentialType)
      };
  }
};
