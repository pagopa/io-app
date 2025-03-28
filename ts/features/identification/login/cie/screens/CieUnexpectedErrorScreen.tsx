/**
 * A screen to alert the user about the number of attempts remains
 */
import { useCallback } from "react";
import I18n from "../../../../../i18n";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { IDENTIFICATION_ROUTES } from "../../../common/navigation/routes";

const CieUnexpectedErrorScreen = () => {
  const navigation = useIONavigation();

  const navigateToCiePinScreen = useCallback(() => {
    navigation.navigate(IDENTIFICATION_ROUTES.MAIN, {
      screen: IDENTIFICATION_ROUTES.CIE_PIN_SCREEN
    });
  }, [navigation]);

  const navigateToAuthenticationScreen = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: IDENTIFICATION_ROUTES.MAIN }]
    });
  }, [navigation]);

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
      pictogram="umbrella"
      title={I18n.t("authentication.cie.card.error.genericErrorTitle")}
      subtitle={I18n.t("authentication.cie.card.error.genericErrorSubtitle")}
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};

export default CieUnexpectedErrorScreen;
