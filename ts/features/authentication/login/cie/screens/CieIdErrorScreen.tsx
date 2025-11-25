import { useEffect } from "react";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import useNavigateToLoginMethod, {
  IdpCIE
} from "../../hooks/useNavigateToLoginMethod";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { TranslationKeys } from "../../../../../../locales/locales";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton";
import {
  trackCieIdErrorCiePinFallbackScreen,
  trackCieIdErrorCiePinSelected,
  trackCieIdErrorSpidFallbackScreen,
  trackCieIdErrorSpidSelected
} from "../analytics";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { idpSelected } from "../../../common/store/actions";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";
import {
  setFinishedActiveSessionLoginFlow,
  setIdpSelectedActiveSessionLogin
} from "../../../activeSessionLogin/store/actions";

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
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);
  const { replace, navigate, popToTop } = useIONavigation();

  useAvoidHardwareBackButton();

  useEffect(() => {
    if (isCieSupported) {
      void trackCieIdErrorCiePinFallbackScreen(
        isActiveSessionLogin ? "reauth" : "auth"
      );
    } else {
      void trackCieIdErrorSpidFallbackScreen(
        isActiveSessionLogin ? "reauth" : "auth"
      );
    }
  }, [isActiveSessionLogin, isCieSupported]);

  const subtitle = I18n.t(isCieSupported ? CIE_PIN_DESC : SPID_DESC);
  const primaryActionLabel = I18n.t(
    isCieSupported ? CIE_PIN_ACTION_LABEL : SPID_ACTION_LABEL
  );
  const secondaryActionLabel = I18n.t(
    "authentication.cie_id.error_screen.secondary_action_label"
  );
  const navigateToLandingScreen = () => {
    if (isActiveSessionLogin) {
      dispatch(setFinishedActiveSessionLoginFlow());
      // allows the user to return to the screen from which the flow began
      popToTop();
    } else {
      replace(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.LANDING
      });
    }
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
            void trackCieIdErrorCiePinSelected(
              isActiveSessionLogin ? "reauth" : "auth"
            );
            if (isActiveSessionLogin) {
              dispatch(setIdpSelectedActiveSessionLogin(IdpCIE));
            } else {
              dispatch(idpSelected(IdpCIE));
            }
            // Since this screen will only be accessible after the user has already
            // made their choice on the Opt-In screen, we can navigate directly to it
            navigate(AUTHENTICATION_ROUTES.MAIN, {
              screen: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
            });
          } else {
            void trackCieIdErrorSpidSelected(
              isActiveSessionLogin ? "reauth" : "auth"
            );
            // Since this screen will only be accessible after the user has already
            // made their choice on the Opt-In screen, we can navigate directly to it
            navigate(AUTHENTICATION_ROUTES.MAIN, {
              screen: AUTHENTICATION_ROUTES.IDP_SELECTION
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
