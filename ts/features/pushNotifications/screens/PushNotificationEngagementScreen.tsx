import i18next from "i18next";
import { Body, HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useCallback, useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { WhatsNewScreenContent } from "../../../components/screens/WhatsNewScreenContent";
import {
  AppParamsList,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import {
  NotificationModalFlow,
  SendOpeningSource,
  SendUserType,
  trackSystemNotificationPermissionScreenOutcome,
  trackSystemNotificationPermissionScreenShown
} from "../analytics";
import { NOTIFICATIONS_ROUTES } from "../navigation/routes";
import { usePushNotificationEngagement } from "../hooks/usePushNotificationEngagement";
import { useIODispatch } from "../../../store/hooks";
import { setSecurityAdviceReadyToShow } from "../../authentication/fastLogin/store/actions/securityAdviceActions";

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

type Props = {
  onPressActivate: () => void;
  shouldSetSecurityAdviceUponLeaving: boolean;
} & PushNotificationEngagementScreenNavigationParams;

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
