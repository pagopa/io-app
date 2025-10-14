import i18next from "i18next";
import { Body, HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useCallback, useEffect } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { WhatsNewScreenContent } from "../../../components/screens/WhatsNewScreenContent";
import {
  AppParamsList,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import {
  NotificationModalFlow,
  trackSystemNotificationPermissionScreenOutcome,
  trackSystemNotificationPermissionScreenShown
} from "../analytics";
import { NOTIFICATIONS_ROUTES } from "../navigation/routes";
import { usePushNotificationEngagement } from "../hooks/usePushNotificationEngagement";

export type PushNotificationEngagementScreenNavigationParams = {
  flow: NotificationModalFlow;
};

export const PushNotificationEngagementScreen = () => {
  const { flow } =
    useRoute<
      RouteProp<
        AppParamsList,
        typeof NOTIFICATIONS_ROUTES.PUSH_NOTIFICATION_ENGAGEMENT
      >
    >().params;
  const { shouldRenderBlankPage, onButtonPress } =
    usePushNotificationEngagement(flow);

  useEffect(() => {
    trackSystemNotificationPermissionScreenShown(flow);
  }, [flow]);

  if (shouldRenderBlankPage) {
    return null;
  }

  return (
    <PushNotificationEngagementScreenContent
      flow={flow}
      onPressActivate={onButtonPress}
    />
  );
};

type Props = {
  onPressActivate: () => void;
} & PushNotificationEngagementScreenNavigationParams;

const PushNotificationEngagementScreenContent = ({
  flow,
  onPressActivate
}: Props) => {
  const { popToTop, setOptions } = useIONavigation();

  const handleCloseScreen = useCallback(() => {
    trackSystemNotificationPermissionScreenOutcome("dismiss", flow);
    popToTop();
  }, [flow, popToTop]);

  useEffect(() => {
    setOptions({
      headerShown: true,
      header: () => (
        <HeaderSecondLevel
          title=""
          ignoreSafeAreaMargin={false}
          type="singleAction"
          firstAction={{
            icon: "closeMedium",
            onPress: handleCloseScreen,
            accessibilityLabel: i18next.t("global.buttons.close"),
            testID: "header-close"
          }}
        />
      )
    });

    return () => {
      setOptions({ headerShown: false });
    };
  }, [handleCloseScreen, setOptions]);

  return (
    <WhatsNewScreenContent
      pictogram="notification"
      title={i18next.t("features.pushNotifications.engagementScreen.title")}
      action={{
        fullWidth: true,
        label: i18next.t("features.pushNotifications.engagementScreen.cta"),
        testID: "engagement-cta",
        onPress: onPressActivate
      }}
      badge={{
        variant: "highlight",
        text: i18next.t("features.pushNotifications.engagementScreen.badge")
      }}
    >
      <Body style={{ textAlign: "center" }}>
        {i18next.t("features.pushNotifications.engagementScreen.body")}
      </Body>
    </WhatsNewScreenContent>
  );
};
