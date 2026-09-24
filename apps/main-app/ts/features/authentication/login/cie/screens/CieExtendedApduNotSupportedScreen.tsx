import I18n from "i18next";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import useActiveSessionLoginNavigation from "../../../activeSessionLogin/utils/useActiveSessionLoginNavigation";

/**
 * Screen to display an error when the CIE card reader does not support extended APDU commands
 */
const CieExtendedApduNotSupportedScreen = () => {
  const { navigateToAuthenticationScreen } = useActiveSessionLoginNavigation();

  const action = {
    label: I18n.t("global.buttons.close"),
    onPress: navigateToAuthenticationScreen
  };

  return (
    <OperationResultScreenContent
      action={action}
      pictogram="attention"
      subtitle={I18n.t("authentication.cie.nfc.apduNotSupported")}
      title={I18n.t("authentication.cie.card.error.genericErrorTitle")}
    />
  );
};

export default CieExtendedApduNotSupportedScreen;
