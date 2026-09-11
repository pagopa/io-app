import { Banner, ModuleNavigation, VSpacer } from "@io-app/design-system";
import I18n from "i18next";
import { useCallback } from "react";
import { View } from "react-native";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import useNavigateToLoginMethod from "../../login/hooks/useNavigateToLoginMethod";
import {
  loginCieWizardSelected,
  trackCieBottomSheetScreenView,
  trackCieIDLoginSelected,
  trackCiePinLoginSelected,
  trackLoginCieIdSelected,
  trackLoginCiePinSelected
} from "../analytics";
import { AUTHENTICATION_ROUTES } from "../navigation/routes";
import { AUTH_LEVELS, AuthLevel } from "../utils";

type LoginFlow = "auth" | "reauth";

type UseCieLoginMethodSelectionParams = {
  flow: LoginFlow;
};
const AUTH_LEVEL_L2: AuthLevel = AUTH_LEVELS.L2;

export const useCieLoginMethodSelection = ({
  flow
}: UseCieLoginMethodSelectionParams) => {
  const store = useIOStore();
  const navigation = useIONavigation();

  const {
    navigateToCiePinInsertion,
    navigateToCieIdLoginScreen,
    isCieSupported
  } = useNavigateToLoginMethod();

  const isReauth = flow === "reauth";

  const handleNavigateToCiePinScreen = useCallback(() => {
    if (isReauth) {
      void trackLoginCiePinSelected("reauth");
    } else {
      void trackCiePinLoginSelected(store.getState());
    }
    navigateToCiePinInsertion();
  }, [isReauth, navigateToCiePinInsertion, store]);

  const handleNavigateToCieIdLoginScreen = useCallback(() => {
    if (isReauth) {
      void trackLoginCieIdSelected(AUTH_LEVEL_L2, "reauth");
    } else {
      void trackCieIDLoginSelected(store.getState(), AUTH_LEVEL_L2);
    }
    navigateToCieIdLoginScreen(AUTH_LEVEL_L2);
  }, [isReauth, navigateToCieIdLoginScreen, store]);

  const handleNavigateToCieIdWizard = useCallback(() => {
    void loginCieWizardSelected(isReauth ? "reauth" : undefined);
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_WIZARD
    });
  }, [isReauth, navigation]);

  const { present, dismiss, bottomSheet } = useIOBottomSheetModal({
    title: I18n.t("authentication.landing.cie_bottom_sheet.title"),
    component: (
      <View>
        <ModuleNavigation
          icon="fiscalCodeIndividual"
          onPress={handleNavigateToCiePinScreen}
          subtitle={I18n.t(
            "authentication.landing.cie_bottom_sheet.module_cie_pin.subtitle"
          )}
          testID="bottom-sheet-login-with-cie-pin"
          title={I18n.t(
            "authentication.landing.cie_bottom_sheet.module_cie_pin.title"
          )}
        />
        <VSpacer size={8} />
        <ModuleNavigation
          badge={{
            variant: "highlight",
            text: I18n.t(
              "authentication.landing.cie_bottom_sheet.module_cie_id.badge"
            )
          }}
          icon="device"
          onPress={handleNavigateToCieIdLoginScreen}
          subtitle={I18n.t(
            "authentication.landing.cie_bottom_sheet.module_cie_id.subtitle"
          )}
          testID="bottom-sheet-login-with-cie-id"
          title={I18n.t(
            "authentication.landing.cie_bottom_sheet.module_cie_id.title"
          )}
        />
        <VSpacer size={24} />
        <Banner
          action={I18n.t(
            "authentication.landing.cie_bottom_sheet.help_banner.action"
          )}
          color="turquoise"
          onPress={handleNavigateToCieIdWizard}
          pictogramName="help"
          testID="bottom-sheet-login-wizards"
          title={I18n.t(
            "authentication.landing.cie_bottom_sheet.help_banner.title"
          )}
        />
        <VSpacer />
      </View>
    ),
    snapPoint: [400]
  });

  const handleCieLoginRequested = useCallback(() => {
    if (isCieSupported) {
      void trackCieBottomSheetScreenView(isReauth ? "reauth" : undefined);
      present();
    } else {
      handleNavigateToCieIdLoginScreen();
    }
  }, [isCieSupported, isReauth, present, handleNavigateToCieIdLoginScreen]);

  return { bottomSheet, dismiss, handleCieLoginRequested };
};
