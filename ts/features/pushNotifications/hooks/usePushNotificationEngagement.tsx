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
import { useIODispatch } from "../../../store/hooks";
import { setSecurityAdviceReadyToShow } from "../../authentication/fastLogin/store/actions/securityAdviceActions";

export const usePushNotificationEngagement = (
  flow: NotificationModalFlow,
  sendOpeningSource: SendOpeningSource,
  sendUserType: SendUserType,
  shouldSetSecurityAdviceUponLeaving: boolean
) => {
  const dispatch = useIODispatch();
  const { popToTop } = useIONavigation();
  const toast = useIOToast();
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      appStateHandler(
        () => {
          if (shouldSetSecurityAdviceUponLeaving) {
            dispatch(setSecurityAdviceReadyToShow(true));
          }
          popToTop();
        },
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
  }, [
    isButtonPressed,
    toast,
    shouldSetSecurityAdviceUponLeaving,
    dispatch,
    popToTop
  ]);

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
  onReturnToApp: () => void,
  onSuccess: () => void,
  isButtonPressed: boolean
) => (nextAppState: AppStateStatus) => Promise<void>;

const appStateHandler: HandlerType =
  (onReturnToApp, onSuccess, isButtonPressed) => async nextAppState => {
    if (nextAppState === "active" && isButtonPressed) {
      const authorizationStatus = await checkNotificationPermissions();
      if (authorizationStatus) {
        onSuccess();
      }
      onReturnToApp();
    }
  };

export const testable = isTestEnv
  ? {
      appStateHandler
    }
  : undefined;
