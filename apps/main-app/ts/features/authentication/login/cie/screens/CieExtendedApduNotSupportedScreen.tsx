/** A screen to alert the user about the number of attempts remains */
import I18n from "i18next";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import useActiveSessionLoginNavigation from "../../../activeSessionLogin/utils/useActiveSessionLoginNavigation";

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
