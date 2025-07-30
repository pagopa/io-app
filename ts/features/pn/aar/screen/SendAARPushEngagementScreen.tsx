import {
  Badge,
  HeaderSecondLevel,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useAARPushEngagementScreenLogic } from "../hooks/useAARpushEngagementScreenLogic";
import {
  trackSystemNotificationPermissionScreenOutcome,
  trackSystemNotificationPermissionScreenShown
} from "../../../pushNotifications/analytics";

export const SendQrScanPushEngagementScreen = () => {
  const navigation = useIONavigation();
  const { shouldRenderBlankPage, onButtonPress } =
    useAARPushEngagementScreenLogic();

  const handleCloseScreen = useCallback(() => {
    trackSystemNotificationPermissionScreenOutcome(
      "dismiss",
      "send_notification_opening"
    );
    navigation.popToTop();
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title=""
          ignoreSafeAreaMargin={false}
          type="singleAction"
          firstAction={{
            icon: "closeMedium",
            onPress: handleCloseScreen,
            accessibilityLabel: I18n.t("global.buttons.close"),
            testID: "header-close"
          }}
        />
      )
    });
    trackSystemNotificationPermissionScreenShown("send_notification_opening");
  }, [handleCloseScreen, navigation]);

  if (shouldRenderBlankPage) {
    return <></>;
  }

  return (
    <OperationResultScreenContent
      isHeaderVisible
      pictogram="notification"
      title={I18n.t("features.pn.aar.pushEngagement.title")}
      subtitle={I18n.t("features.pn.aar.pushEngagement.body")}
      topElement={<TopElement />}
      action={{
        label: I18n.t("features.pn.aar.pushEngagement.cta"),
        onPress: onButtonPress,
        testID: "engagement-cta"
      }}
    />
  );
};

const TopElement = () => (
  <View style={{ alignItems: "center" }}>
    <Badge
      variant="highlight"
      text={I18n.t("features.pn.aar.pushEngagement.badge")}
    />
    <VSpacer size={8} />
  </View>
);
