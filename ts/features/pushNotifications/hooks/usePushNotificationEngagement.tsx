import { IOToast } from "@pagopa/io-app-design-system";
import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import I18n from "i18next";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import {
  checkNotificationPermissions,
  openSystemNotificationSettingsScreen
} from "../utils";
import {
  NotificationModalFlow,
  trackSystemNotificationPermissionScreenOutcome
} from "../analytics";
import { isTestEnv } from "../../../utils/environment";

export const usePushNotificationEngagement = (flow: NotificationModalFlow) => {
  const { popToTop } = useIONavigation();
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      appStateHandler(popToTop, isButtonPressed)
    );
    return () => {
      subscription.remove();
    };
  }, [isButtonPressed, popToTop]);

  const onButtonPress = () => {
    trackSystemNotificationPermissionScreenOutcome("activate", flow);
    openSystemNotificationSettingsScreen();
    setIsButtonPressed(true);
  };

  return { shouldRenderBlankPage: isButtonPressed, onButtonPress };
};

type HandlerType = (
  popToTop: () => void,
  isButtonPressed: boolean
) => (nextAppState: AppStateStatus) => Promise<void>;

const appStateHandler: HandlerType =
  (popToTop, isButtonPressed) => async nextAppState => {
    if (nextAppState === "active" && isButtonPressed) {
      const authorizationStatus = await checkNotificationPermissions();
      if (authorizationStatus) {
        IOToast.success(
          I18n.t("features.pushNotifications.engagementScreen.toast")
        );
      }
      popToTop();
    }
  };

export const testable = isTestEnv
  ? {
      appStateHandler
    }
  : undefined;
