/**
 * A screen to alert the user about the number of attempts remains
 */
import I18n from "i18next";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import useActiveSessionLoginNavigation from "../../../activeSessionLogin/utils/useActiveSessionLoginNavigation";

const CieUnexpectedErrorScreen = () => {
  const navigation = useIONavigation();

  const { navigateToAuthenticationScreen } = useActiveSessionLoginNavigation();

  const navigateToCiePinScreen = () => {
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
    });
  };

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
      enableAnimatedPictogram
      pictogram="umbrella"
      title={I18n.t("authentication.cie.card.error.genericErrorTitle")}
      subtitle={I18n.t("authentication.cie.card.error.genericErrorSubtitle")}
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};

export default CieUnexpectedErrorScreen;
