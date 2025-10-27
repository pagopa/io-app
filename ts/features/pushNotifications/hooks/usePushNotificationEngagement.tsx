import { useIOToast } from "@pagopa/io-app-design-system";
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
  SendOpeningSource,
  SendUserType,
  trackSystemNotificationPermissionScreenOutcome
} from "../analytics";
import { isTestEnv } from "../../../utils/environment";

export const usePushNotificationEngagement = (
  flow: NotificationModalFlow,
  sendOpeningSource: SendOpeningSource,
  sendUserType: SendUserType
) => {
  const { popToTop } = useIONavigation();
  const toast = useIOToast();
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      appStateHandler(
        popToTop,
        () => {
          toast.success(
            I18n.t("features.pushNotifications.engagementScreen.toast")
          );
        },
        isButtonPressed
      )
    );
    return () => {
      subscription.remove();
    };
  }, [isButtonPressed, toast, popToTop]);

  const onButtonPress = () => {
    trackSystemNotificationPermissionScreenOutcome(
      "activate",
      flow,
      sendOpeningSource,
      sendUserType
    );
    openSystemNotificationSettingsScreen();
    setIsButtonPressed(true);
  };

  return { shouldRenderBlankPage: isButtonPressed, onButtonPress };
};

type HandlerType = (
  popToTop: () => void,
  onSuccess: () => void,
  isButtonPressed: boolean
) => (nextAppState: AppStateStatus) => Promise<void>;

const appStateHandler: HandlerType =
  (popToTop, onSuccess, isButtonPressed) => async nextAppState => {
    if (nextAppState === "active" && isButtonPressed) {
      const authorizationStatus = await checkNotificationPermissions();
      if (authorizationStatus) {
        onSuccess();
      }
      popToTop();
    }
  };

export const testable = isTestEnv
  ? {
      appStateHandler
    }
  : undefined;
