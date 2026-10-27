import { StackActions, useFocusEffect } from "@react-navigation/core";
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
import { LOGIN_TYPES, LoginType } from "../../../common/utils";

type OneIdentityIdpSelectionFailureContentProps = {
  flow: LoginType;
};

export const OneIdentityIdpSelectionFailureContent = ({
  flow
}: OneIdentityIdpSelectionFailureContentProps) => {
  const navigation = useIONavigation();
  const accessibilityFirstFocuseViewRef = useRef<View>(null);

  const {
    bottomSheet,
    dismiss: dismissBottomSheet,
    handleCieLoginRequested
  } = useCieLoginMethodSelection({ flow });

  useFocusEffect(
    useCallback(() => {
      setAccessibilityFocus(accessibilityFirstFocuseViewRef);

      return dismissBottomSheet;
    }, [dismissBottomSheet])
  );

  const navigateToCiePinScreen = useCallback(() => {
    if (flow === LOGIN_TYPES.AUTH) {
      void trackCieLoginSelected();
    } else {
      void trackLoginReauthEngagementCieSelected();
    }
    handleCieLoginRequested();
  }, [flow, handleCieLoginRequested]);

  const navigateToLandingScreen = useCallback(() => {
    navigation.dispatch(StackActions.popTo(AUTHENTICATION_ROUTES.LANDING));
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
        isHeaderVisible={true}
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
