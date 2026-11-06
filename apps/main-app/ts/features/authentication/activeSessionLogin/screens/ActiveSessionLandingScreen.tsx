/**
 * A screen where the user can choose to login with SPID or get more
 * informations. It includes a carousel with highlights on the app
 * functionalities
 */
import {
  ContentWrapper,
  HeaderSecondLevel,
  IOButton,
  VSpacer
} from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useLayoutEffect, useRef } from "react";
import { View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";

import SectionStatusComponent from "../../../../components/SectionStatus";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useCieLoginMethodSelection } from "../../common/hooks/useCieLoginMethodSelection";
import { LOGIN_TYPES } from "../../common/utils";
import { isCieProdSelector } from "../../login/cie/store/selectors";
import useNavigateToLoginMethod from "../../login/hooks/useNavigateToLoginMethod";
import { LandingSessionExpiredComponent } from "../../login/landing/components/LandingSessionExpiredComponent";
import { setActiveSessionLoginBlockingScreenHasBeenVisualized } from "../store/actions";
import {
  trackLoginReauthEngagement,
  trackLoginReauthEngagementCieSelected,
  trackLoginReauthEngagementDismissed,
  trackLoginReauthEngagementSpidSelected
} from "./analytics";

const SPACE_BETWEEN_BUTTONS = 8;
const SPACE_AROUND_BUTTON_LINK = 16;

export const ActiveSessionLandingScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const accessibilityFirstFocuseViewRef = useRef<View>(null);
  const { navigateToIdpSelection } = useNavigateToLoginMethod();

  const {
    bottomSheet,
    dismiss: dismissBottomSheet,
    handleCieLoginRequested
  } = useCieLoginMethodSelection({ flow: LOGIN_TYPES.REAUTH });

  useOnFirstRender(() => {
    void trackLoginReauthEngagement();
    dispatch(setActiveSessionLoginBlockingScreenHasBeenVisualized());
  });

  const isCieProd = useIOSelector(isCieProdSelector);

  useFocusEffect(
    useCallback(() => {
      setAccessibilityFocus(accessibilityFirstFocuseViewRef);

      return dismissBottomSheet;
    }, [dismissBottomSheet])
  );

  const navigateToCiePinScreen = useCallback(() => {
    void trackLoginReauthEngagementCieSelected();
    handleCieLoginRequested();
  }, [handleCieLoginRequested]);

  const handleClosePress = useCallback(() => {
    void trackLoginReauthEngagementDismissed();
    navigation.goBack();
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: handleClosePress
          }}
          title={""}
          type="singleAction"
        />
      )
    });
  }, [navigation, handleClosePress]);

  return (
    <SafeAreaView style={{ flex: 1 }} testID="LandingScreen">
      <LandingSessionExpiredComponent
        content={I18n.t("authentication.landing.active_session_login.body")}
        pictogramName={"identityCheck"}
        ref={accessibilityFirstFocuseViewRef}
        title={I18n.t("authentication.landing.active_session_login.title")}
      />

      <SectionStatusComponent sectionKey={"login"} />
      <ContentWrapper>
        <IOButton
          color={isCieProd ? "primary" : "danger"}
          fullWidth
          icon="cie"
          label={I18n.t("authentication.landing.loginCie")}
          onPress={navigateToCiePinScreen}
          testID="landing-button-login-cie"
          variant="solid"
        />
        <VSpacer size={SPACE_BETWEEN_BUTTONS} />

        <IOButton
          color="primary"
          fullWidth
          icon="spid"
          // if CIE is not supported, since the new DS has not a
          // "semi-enabled" state, we leave the button enabled
          // but we navigate to the CIE unsupported info screen.
          label={I18n.t("authentication.landing.loginSpid")}
          onPress={() => {
            void trackLoginReauthEngagementSpidSelected();
            navigateToIdpSelection();
          }}
          testID="landing-button-login-spid"
          variant="solid"
        />
        <VSpacer size={SPACE_AROUND_BUTTON_LINK} />
        {insets.bottom !== 0 && <VSpacer size={SPACE_AROUND_BUTTON_LINK} />}
        {bottomSheet}
      </ContentWrapper>
    </SafeAreaView>
  );
};
