/**
 * A screen where the user can choose to login with SPID or get more informations.
 * It includes a carousel with highlights on the app functionalities
 */
import {
  Banner,
  ContentWrapper,
  HeaderSecondLevel,
  IOButton,
  ModuleNavigation,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useLayoutEffect, useRef } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "i18next";
import SectionStatusComponent from "../../../../components/SectionStatus";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
// import {
//   loginCieWizardSelected,
//   trackCieBottomSheetScreenView,
//   trackCieIDLoginSelected,
//   trackCieLoginSelected,
//   trackCiePinLoginSelected,
//    trackSpidLoginSelected
// } from "../../common/analytics";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";

import { isCieLoginUatEnabledSelector } from "../../login/cie/store/selectors";
import { SpidLevel } from "../../login/cie/utils";
import useNavigateToLoginMethod from "../../login/hooks/useNavigateToLoginMethod";
import { LandingSessionExpiredComponent } from "../../login/landing/components/LandingSessionExpiredComponent";

const SPACE_BETWEEN_BUTTONS = 8;
const SPACE_AROUND_BUTTON_LINK = 16;
const SPID_LEVEL: SpidLevel = "SpidL2";

// The MP events related to this page have been commented on,
// pending their correct integration into the flow.
// Task: https://pagopa.atlassian.net/browse/IOPID-3343

export const ActiveSessionLandingScreen = () => {
  const insets = useSafeAreaInsets();

  const accessibilityFirstFocuseViewRef = useRef<View>(null);
  const {
    navigateToIdpSelection,
    navigateToCiePinInsertion,
    navigateToCieIdLoginScreen,
    isCieSupported
  } = useNavigateToLoginMethod();

  const handleNavigateToCieIdLoginScreen = useCallback(() => {
    // void trackCieIDLoginSelected(store.getState(), SPID_LEVEL);
    navigateToCieIdLoginScreen(SPID_LEVEL);
  }, [navigateToCieIdLoginScreen]);

  const {
    present,
    dismiss: dismissBottomSheet,
    bottomSheet
  } = useIOBottomSheetModal({
    title: I18n.t("authentication.landing.cie_bottom_sheet.title"),
    component: (
      <View>
        <ModuleNavigation
          title={I18n.t(
            "authentication.landing.cie_bottom_sheet.module_cie_pin.title"
          )}
          subtitle={I18n.t(
            "authentication.landing.cie_bottom_sheet.module_cie_pin.subtitle"
          )}
          icon="fiscalCodeIndividual"
          testID="bottom-sheet-login-with-cie-pin"
          onPress={navigateToCiePinInsertion}
        />
        <VSpacer size={8} />
        <ModuleNavigation
          title={I18n.t(
            "authentication.landing.cie_bottom_sheet.module_cie_id.title"
          )}
          subtitle={I18n.t(
            "authentication.landing.cie_bottom_sheet.module_cie_id.subtitle"
          )}
          icon="device"
          testID="bottom-sheet-login-with-cie-id"
          badge={{
            variant: "highlight",
            text: I18n.t(
              "authentication.landing.cie_bottom_sheet.module_cie_id.badge"
            )
          }}
          onPress={handleNavigateToCieIdLoginScreen}
        />
        <VSpacer size={24} />
        <Banner
          onPress={() => {
            // void loginCieWizardSelected();

            navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
              screen: AUTHENTICATION_ROUTES.CIE_ID_WIZARD
            });
          }}
          testID="bottom-sheet-login-wizards"
          pictogramName="help"
          color="turquoise"
          title={I18n.t(
            "authentication.landing.cie_bottom_sheet.help_banner.title"
          )}
          action={I18n.t(
            "authentication.landing.cie_bottom_sheet.help_banner.action"
          )}
        />
        <VSpacer />
      </View>
    ),
    snapPoint: [400]
  });

  const navigation = useIONavigation();

  const isCieUatEnabled = useIOSelector(isCieLoginUatEnabledSelector);

  useFocusEffect(
    useCallback(() => {
      setAccessibilityFocus(accessibilityFirstFocuseViewRef);

      return dismissBottomSheet;
    }, [dismissBottomSheet])
  );

  const navigateToCiePinScreen = useCallback(() => {
    // void trackCieLoginSelected();
    if (isCieSupported) {
      // void trackCieBottomSheetScreenView();
      present();
    } else {
      handleNavigateToCieIdLoginScreen();
    }
  }, [isCieSupported, present, handleNavigateToCieIdLoginScreen]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title={""}
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: navigation.goBack
          }}
        />
      )
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1 }} testID="LandingScreen">
      <LandingSessionExpiredComponent
        ref={accessibilityFirstFocuseViewRef}
        pictogramName={"identityCheck"}
        title={I18n.t("authentication.landing.active_session_login.title")}
        content={I18n.t("authentication.landing.active_session_login.body")}
      />

      <SectionStatusComponent sectionKey={"login"} />
      <ContentWrapper>
        <IOButton
          fullWidth
          variant="solid"
          color={isCieUatEnabled ? "danger" : "primary"}
          label={I18n.t("authentication.landing.loginCie")}
          icon="cieLetter"
          onPress={navigateToCiePinScreen}
          testID="landing-button-login-cie"
        />
        <VSpacer size={SPACE_BETWEEN_BUTTONS} />

        <IOButton
          fullWidth
          variant="solid"
          color="primary"
          // if CIE is not supported, since the new DS has not a
          // "semi-enabled" state, we leave the button enabled
          // but we navigate to the CIE unsupported info screen.
          label={I18n.t("authentication.landing.loginSpid")}
          icon="spid"
          onPress={() => {
            // void trackSpidLoginSelected();
            navigateToIdpSelection();
          }}
          testID="landing-button-login-spid"
        />
        <VSpacer size={SPACE_AROUND_BUTTON_LINK} />
        {insets.bottom !== 0 && <VSpacer size={SPACE_AROUND_BUTTON_LINK} />}
        {bottomSheet}
      </ContentWrapper>
    </View>
  );
};
