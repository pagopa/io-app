import { IOColors } from "@pagopa/io-app-design-system";
import { CredentialType } from "./itwMocksUtils";

export const getThemeColorByCredentialType = (
  credentialType: CredentialType
) => {
  switch (credentialType) {
    case CredentialType.PID:
      return IOColors["blueItalia-600"];
    case CredentialType.DRIVING_LICENSE:
      return IOColors.antiqueFuchsia;
    default:
      return IOColors["blueItalia-850"];
  }
};
