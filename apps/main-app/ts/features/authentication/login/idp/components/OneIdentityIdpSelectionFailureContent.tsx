import { useFocusEffect } from "@react-navigation/core";
import I18n from "i18next";
import { useCallback, useRef } from "react";
import { View } from "react-native";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { trackLoginReauthEngagementCieSelected } from "../../../activeSessionLogin/screens/analytics";
import { trackCieLoginSelected } from "../../../common/analytics";
import { useCieLoginMethodSelection } from "../../../common/hooks/useCieLoginMethodSelection";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";

type OneIdentityIdpSelectionFailureContentProps = {
  isActiveSessionLogin: boolean;
};

export const OneIdentityIdpSelectionFailureContent = ({
  isActiveSessionLogin
}: OneIdentityIdpSelectionFailureContentProps) => {
  const navigation = useIONavigation();
  const accessibilityFirstFocuseViewRef = useRef<View>(null);

  const {
    bottomSheet,
    dismiss: dismissBottomSheet,
    handleCieLoginRequested
  } = useCieLoginMethodSelection({
    flow: isActiveSessionLogin ? "reauth" : "auth"
  });

  useFocusEffect(
    useCallback(() => {
      setAccessibilityFocus(accessibilityFirstFocuseViewRef);

      return dismissBottomSheet;
    }, [dismissBottomSheet])
  );

  const navigateToCiePinScreen = useCallback(() => {
    if (isActiveSessionLogin) {
      void trackLoginReauthEngagementCieSelected();
    } else {
      void trackCieLoginSelected();
    }
    handleCieLoginRequested();
  }, [isActiveSessionLogin, handleCieLoginRequested]);

  const navigateToLandingScreen = useCallback(() => {
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  }, [navigation]);

  return (
    <>
      <OperationResultScreenContent
        action={{
          label: I18n.t(
            "authentication.idp_selection.loadingError.primaryAction"
          ),
          onPress: navigateToCiePinScreen,
          testID: "idp-loading-error-primary-action"
        }}
        pictogram="umbrella"
        ref={accessibilityFirstFocuseViewRef}
        secondaryAction={{
          label: I18n.t(
            "authentication.idp_selection.loadingError.secondaryAction"
          ),
          onPress: navigateToLandingScreen,
          testID: "idp-loading-error-secondary-action"
        }}
        subtitle={I18n.t(
          "authentication.idp_selection.loadingError.description"
        )}
        title={I18n.t("authentication.idp_selection.loadingError.title")}
      />
      {bottomSheet}
    </>
  );
};
