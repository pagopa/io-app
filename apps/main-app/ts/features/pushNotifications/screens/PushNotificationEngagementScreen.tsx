import { Body, HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import i18next from "i18next";
import { useCallback, useEffect } from "react";

import { WhatsNewScreenContent } from "../../../components/screens/WhatsNewScreenContent";
import {
  AppParamsList,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../store/hooks";
import { setSecurityAdviceReadyToShow } from "../../authentication/fastLogin/store/actions/securityAdviceActions";
import {
  NotificationModalFlow,
  SendOpeningSource,
  SendUserType,
  trackSystemNotificationPermissionScreenOutcome,
  trackSystemNotificationPermissionScreenShown
} from "../analytics";
import { usePushNotificationEngagement } from "../hooks/usePushNotificationEngagement";
import { NOTIFICATIONS_ROUTES } from "../navigation/routes";

export type PushNotificationEngagementScreenNavigationParams = {
  flow: NotificationModalFlow;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
};
type PushNotificationEngagementScreenProps = NativeStackScreenProps<
  AppParamsList,
  typeof NOTIFICATIONS_ROUTES.PUSH_NOTIFICATION_ENGAGEMENT
>;

export const PushNotificationEngagementScreen = ({
  route
}: PushNotificationEngagementScreenProps) => {
  const { flow, sendOpeningSource, sendUserType } = route.params;
  const shouldSetSecurityAdviceUponLeaving = flow === "access";
  const { shouldRenderBlankPage, onButtonPress } =
    usePushNotificationEngagement(
      flow,
      sendOpeningSource,
      sendUserType,
      shouldSetSecurityAdviceUponLeaving
    );

  useEffect(() => {
    trackSystemNotificationPermissionScreenShown(
      flow,
      sendOpeningSource,
      sendUserType
    );
  }, [flow, sendOpeningSource, sendUserType]);

  if (shouldRenderBlankPage) {
    return null;
  }

  return (
    <PushNotificationEngagementScreenContent
      flow={flow}
      onPressActivate={onButtonPress}
      sendOpeningSource={sendOpeningSource}
      sendUserType={sendUserType}
      shouldSetSecurityAdviceUponLeaving={shouldSetSecurityAdviceUponLeaving}
    />
  );
};

type Props = PushNotificationEngagementScreenNavigationParams & {
  onPressActivate: () => void;
  shouldSetSecurityAdviceUponLeaving: boolean;
};

const PushNotificationEngagementScreenContent = ({
  flow,
  onPressActivate,
  sendOpeningSource,
  sendUserType,
  shouldSetSecurityAdviceUponLeaving
}: Props) => {
  const dispatch = useIODispatch();
  const { popToTop, setOptions } = useIONavigation();

  const handleCloseScreen = useCallback(() => {
    if (shouldSetSecurityAdviceUponLeaving) {
      dispatch(setSecurityAdviceReadyToShow(true));
    }
    trackSystemNotificationPermissionScreenOutcome(
      "dismiss",
      flow,
      sendOpeningSource,
      sendUserType
    );
    popToTop();
  }, [
    flow,
    sendOpeningSource,
    sendUserType,
    shouldSetSecurityAdviceUponLeaving,
    dispatch,
    popToTop
  ]);

  useEffect(() => {
    setOptions({
      header: () => (
        <HeaderSecondLevel
          firstAction={{
            icon: "closeMedium",
            onPress: handleCloseScreen,
            accessibilityLabel: i18next.t("global.buttons.close"),
            testID: "header-close"
          }}
          ignoreSafeAreaMargin={false}
          title=""
          type="singleAction"
        />
      )
    });
  }, [handleCloseScreen, setOptions]);

  return (
    <WhatsNewScreenContent
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
      pictogram="notification"
      title={i18next.t("features.pushNotifications.engagementScreen.title")}
    >
      <Body style={{ textAlign: "center" }}>
        {i18next.t("features.pushNotifications.engagementScreen.body")}
      </Body>
    </WhatsNewScreenContent>
  );
};
