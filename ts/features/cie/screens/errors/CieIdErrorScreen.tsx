import React, { useEffect } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import useNavigateToLoginMethod, {
  IdpCIE
} from "../../../../hooks/useNavigateToLoginMethod";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import I18n from "../../../../i18n";
import { TranslationKeys } from "../../../../../locales/locales";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import ROUTES from "../../../../navigation/routes";
import {
  trackCieIdErrorCiePinFallbackScreen,
  trackCieIdErrorCiePinSelected,
  trackCieIdErrorSpidFallbackScreen,
  trackCieIdErrorSpidSelected
} from "../../analytics";
import { useIODispatch } from "../../../../store/hooks";
import { idpSelected } from "../../../../store/actions/authentication";

const CIE_PIN_DESC: TranslationKeys =
  "authentication.cie_id.error_screen.cie_pin_supported.description";
const CIE_PIN_ACTION_LABEL: TranslationKeys =
  "authentication.cie_id.error_screen.cie_pin_supported.primary_action_label";
const SPID_DESC: TranslationKeys =
  "authentication.cie_id.error_screen.cie_pin_not_supported.description";
const SPID_ACTION_LABEL: TranslationKeys =
  "authentication.cie_id.error_screen.cie_pin_not_supported.primary_action_label";

const CieIdErrorScreen = () => {
  const { isCieSupported } = useNavigateToLoginMethod();
  const dispatch = useIODispatch();
  const { replace, navigate } = useIONavigation();

  useAvoidHardwareBackButton();

  useEffect(() => {
    if (isCieSupported) {
      void trackCieIdErrorCiePinFallbackScreen();
    } else {
      void trackCieIdErrorSpidFallbackScreen();
    }
  }, [isCieSupported]);

  const subtitle = I18n.t(isCieSupported ? CIE_PIN_DESC : SPID_DESC);
  const primaryActionLabel = I18n.t(
    isCieSupported ? CIE_PIN_ACTION_LABEL : SPID_ACTION_LABEL
  );
  const secondaryActionLabel = I18n.t(
    "authentication.cie_id.error_screen.secondary_action_label"
  );
  const navigateToLandingScreen = () => {
    replace(ROUTES.AUTHENTICATION, { screen: ROUTES.AUTHENTICATION_LANDING });
  };

  return (
    <OperationResultScreenContent
      title={I18n.t("authentication.cie_id.error_screen.title")}
      subtitle={subtitle}
      pictogram="help"
      action={{
        testID: "cie-id-error-primary-action",
        label: primaryActionLabel,
        accessibilityLabel: primaryActionLabel,
        onPress: () => {
          if (isCieSupported) {
            void trackCieIdErrorCiePinSelected();
            // Since this screen will only be accessible after the user has already
            // made their choice on the Opt-In screen, we can navigate directly to it
            dispatch(idpSelected(IdpCIE));
            navigate(ROUTES.AUTHENTICATION, {
              screen: ROUTES.CIE_PIN_SCREEN
            });
          } else {
            void trackCieIdErrorSpidSelected();
            // Since this screen will only be accessible after the user has already
            // made their choice on the Opt-In screen, we can navigate directly to it
            navigate(ROUTES.AUTHENTICATION, {
              screen: ROUTES.AUTHENTICATION_IDP_SELECTION
            });
          }
        }
      }}
      secondaryAction={{
        testID: "cie-id-error-secondary-action",
        label: secondaryActionLabel,
        accessibilityLabel: secondaryActionLabel,
        onPress: navigateToLandingScreen
      }}
    />
  );
};

export default CieIdErrorScreen;
