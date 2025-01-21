/**
 * A screen to alert the user about the number of attempts remains
 */
import { useCallback } from "react";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";

const CieWrongCardScreen = () => {
  const navigation = useIONavigation();

  const navigateToCiePinScreen = useCallback(() => {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.CIE_PIN_SCREEN
    });
  }, [navigation]);

  const navigateToAuthenticationScreen = useCallback(() => {
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
      pictogram="cardQuestion"
      title={I18n.t("authentication.cie.card.error.genericErrorTitle")}
      subtitle={I18n.t("authentication.cie.card.error.unknownCardContent")}
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};

export default CieWrongCardScreen;
