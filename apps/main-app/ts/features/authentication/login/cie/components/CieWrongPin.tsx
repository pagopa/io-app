import I18n from "i18next";
import { useCallback } from "react";
import { Linking } from "react-native";

import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import useActiveSessionLoginNavigation from "../../../activeSessionLogin/utils/useActiveSessionLoginNavigation";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";

export type CieWrongPinProps = {
  remainingCount: number;
};

export const CieWrongPin = ({ remainingCount }: CieWrongPinProps) => {
  const navigation = useIONavigation();
  const { navigateToAuthenticationScreen } = useActiveSessionLoginNavigation();

  const navigateToCiePinScreen = useCallback(() => {
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
    });
  }, [navigation]);

  const retryAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("global.buttons.retry"),
    onPress: navigateToCiePinScreen
  };

  const closeAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("global.buttons.close"),
    onPress: navigateToAuthenticationScreen
  };

  const handlePinRecovery = useCallback(() => {
    Linking.openURL(
      "https://www.cartaidentita.interno.gov.it/info-utili/codici-di-sicurezza-pin-e-puk/"
    ).catch(() => null);
  }, []);

  const handlePukRecovery = useCallback(() => {
    Linking.openURL(
      "https://www.cartaidentita.interno.gov.it/info-utili/recupero-puk/"
    ).catch(() => null);
  }, []);

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      switch (remainingCount) {
        case 0:
          return {
            pictogram: "fatalError",
            title: I18n.t("authentication.cie.pin.lockedCiePinTitle"),
            subtitle: I18n.t("authentication.cie.pin.lockedCiePinContent"),
            action: closeAction,
            secondaryAction: {
              label: I18n.t(
                "authentication.cie.pin.lockedSecondaryActionLabel"
              ),
              onPress: handlePukRecovery
            }
          };
        case 1:
          return {
            pictogram: "attention",
            title: I18n.t("authentication.cie.pin.incorrectCiePinTitle2"),
            subtitle: I18n.t("authentication.cie.pin.incorrectCiePinContent2"),
            action: retryAction,
            secondaryAction: {
              label: I18n.t(
                "authentication.cie.pin.incorrectCiePinSecondaryActionLabel2"
              ),
              onPress: handlePinRecovery
            }
          };
        case 2:
          return {
            pictogram: "attention",
            title: I18n.t("authentication.cie.pin.incorrectCiePinTitle1"),
            subtitle: I18n.t("authentication.cie.pin.incorrectCiePinContent1"),
            action: retryAction,
            secondaryAction: closeAction
          };
        default:
          return {
            pictogram: "attention",
            title: I18n.t("global.genericError"),
            subtitle: String(remainingCount),
            action: retryAction,
            secondaryAction: closeAction
          };
      }
    };

  const resultScreenProps = getOperationResultScreenContentProps();
  return <OperationResultScreenContent {...resultScreenProps} />;
};
