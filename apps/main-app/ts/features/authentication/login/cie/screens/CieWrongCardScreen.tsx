/** A screen to alert the user about the number of attempts remains */
import I18n from "i18next";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import useActiveSessionLoginNavigation from "../../../activeSessionLogin/utils/useActiveSessionLoginNavigation";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";

const CieWrongCardScreen = () => {
  const navigation = useIONavigation();

  const navigateToCiePinScreen = () => {
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
    });
  };

  const { navigateToAuthenticationScreen } = useActiveSessionLoginNavigation();

  const action = {
    label: I18n.t("global.buttons.retry"),
    onPress: navigateToCiePinScreen
  };

  const secondaryAction = {
    label: I18n.t("global.buttons.close"),
    onPress: navigateToAuthenticationScreen
  };

  return (
    <OperationResultScreenContent
      action={action}
      pictogram="cardQuestion"
      secondaryAction={secondaryAction}
      subtitle={I18n.t("authentication.cie.card.error.unknownCardContent")}
      title={I18n.t("authentication.cie.card.error.genericErrorTitle")}
    />
  );
};

export default CieWrongCardScreen;
