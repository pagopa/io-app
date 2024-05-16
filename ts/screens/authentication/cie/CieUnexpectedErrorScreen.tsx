/**
 * A screen to alert the user about the number of attempts remains
 */
import * as React from "react";
import { Platform } from "react-native";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";

export type CieWrongCiePinScreenNavigationParams = {
  remainingCount: number;
};

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

  const title = Platform.select({
    ios: I18n.t("authentication.cie.card.error.genericErroriOSTitle"),
    default: I18n.t("authentication.cie.card.error.genericErrorTitle")
  });

  const subtitle = Platform.select({
    ios: I18n.t("authentication.cie.card.error.genericErroriOSSubtitle"),
    default: undefined
  });

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
      title={title}
      subtitle={subtitle}
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};

export default CieUnexpectedErrorScreen;
