/**
 * A screen to alert the user about the number of attempts remains
 */
import * as React from "react";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";

const CieUnexpectedErrorScreen = () => {
  const navigation = useIONavigation();

  const navigateToCiePinScreen = React.useCallback(() => {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.CIE_PIN_SCREEN
    });
  }, [navigation]);

  const navigateToAuthenticationScreen = React.useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: ROUTES.AUTHENTICATION }]
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
      pictogram="umbrellaNew"
      title={I18n.t("authentication.cie.card.error.genericErrorTitle")}
      subtitle={I18n.t("authentication.cie.card.error.genericErrorSubtitle")}
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};

export default CieUnexpectedErrorScreen;
