import { IOToast } from "@pagopa/io-app-design-system";
import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { isTestEnv } from "../../../../utils/environment";
import {
  checkNotificationPermissions,
  openSystemNotificationSettingsScreen
} from "../../../pushNotifications/utils";
import { trackSystemNotificationPermissionScreenOutcome } from "../../../pushNotifications/analytics";

export const useAARPushEngagementScreenLogic = () => {
  const navigation = useIONavigation();
  const [isButtonPressed, setIsButtonPressed] = useState<boolean>(false);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      appStateHandler(navigation.popToTop, isButtonPressed)
    );
    return () => {
      subscription.remove();
    };
  }, [isButtonPressed, navigation]);

  const onButtonPress = () => {
    trackSystemNotificationPermissionScreenOutcome(
      "activate",
      "send_notification_opening"
    );
    navigation.setOptions({ headerShown: false });
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
        IOToast.success(I18n.t("features.pn.aar.pushEngagement.toast"));
      }
      popToTop();
    }
  };

export const testable = isTestEnv
  ? {
      appStateHandler
    }
  : undefined;
