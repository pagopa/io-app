/**
 * A screen to invite the user to update the app because current version is not supported yet
 *
 */

import { FC, useCallback, useEffect, useRef, useState } from "react";

import {
  Dismissable,
  IOColors,
  IOVisualCostants,
  ToastNotification,
  useIOTheme
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { AccessibilityInfo, Modal, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  SequencedTransition,
  SlideInUp,
  SlideOutUp
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OperationResultScreenContent } from "../../components/screens/OperationResultScreenContent";
import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import { openAppStoreUrl } from "../../utils/url";
import { trackForcedUpdateScreen, trackUpdateAppButton } from "./analytics";

const UpdateAppModal: FC = () => {
  // Disable Android back button
  useHardwareBackButton(() => true);
  trackForcedUpdateScreen();

  const insets = useSafeAreaInsets();
  const timeoutRef = useRef<number>(undefined);
  const [isError, setIsError] = useState(false);

  const title = I18n.t("titleUpdateApp");
  const subtitle = I18n.t("messageUpdateApp");
  const actionLabel = I18n.t("btnUpdateApp");
  const errorMessage = I18n.t("msgErrorUpdateApp");

  useEffect(() => {
    if (isError) {
      AccessibilityInfo.announceForAccessibility(errorMessage);
      // eslint-disable-next-line functional/immutable-data
      timeoutRef.current = setTimeout(() => setIsError(false), 5000);
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [isError, errorMessage]);

  // Tries to open the native app store, falling to browser web store
  const openAppStore = useCallback(async () => {
    trackUpdateAppButton();

    void openAppStoreUrl(() => setIsError(true));
  }, []);

  const handleCloseError = useCallback(() => {
    setIsError(false);
  }, []);

  const theme = useIOTheme();

  return (
    <Modal backdropColor={IOColors[theme["appBackground-primary"]]}>
      <OperationResultScreenContent
        pictogram="updateOS"
        title={title}
        subtitle={subtitle}
        action={{
          label: actionLabel,
          accessibilityLabel: actionLabel,
          onPress: openAppStore
        }}
      />
      {/* Temporary, to be replaced after this Jira task (IOPID-1799) has been closed  */}
      {isError && (
        <View accessible style={[styles.alertContainer, { top: insets.top }]}>
          <Animated.View
            entering={SlideInUp.duration(300).easing(Easing.inOut(Easing.exp))}
            exiting={SlideOutUp.duration(300).easing(Easing.inOut(Easing.exp))}
            layout={SequencedTransition.duration(300)}
            style={{ paddingBottom: 8 }}
          >
            <Dismissable onDismiss={handleCloseError}>
              <ToastNotification
                message={errorMessage}
                icon="errorFilled"
                variant="error"
              />
            </Dismissable>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    position: "absolute",
    right: IOVisualCostants.appMarginDefault,
    left: IOVisualCostants.appMarginDefault,
    zIndex: 1000
  }
});

export default UpdateAppModal;
