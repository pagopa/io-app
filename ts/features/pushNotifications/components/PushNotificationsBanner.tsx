import {
  Banner,
  Body,
  FooterActions,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import {
  resetNotificationBannerDismissState,
  setPushNotificationBannerForceDismissed,
  setUserDismissedNotificationsBanner
} from "../store/actions/userBehaviour";
import { openSystemNotificationSettingsScreen } from "../utils";
import {
  shouldResetNotificationBannerDismissStateSelector,
  timesPushNotificationBannerDismissedSelector
} from "../store/selectors/notificationsBannerDismissed";
import { MESSAGES_ROUTES } from "../../messages/navigation/routes";
import {
  trackPushNotificationBannerDismissAlert,
  trackPushNotificationBannerDismissOutcome,
  trackPushNotificationBannerForceShow,
  trackPushNotificationsBannerClosure,
  trackPushNotificationsBannerTap,
  trackPushNotificationsBannerVisualized
} from "../analytics";
type Props = {
  closeHandler: () => void;
};

export const PushNotificationsBanner = ({ closeHandler }: Props) => {
  const dispatch = useIODispatch();
  const shouldResetDismissState = useIOSelector(
    shouldResetNotificationBannerDismissStateSelector
  );

  React.useEffect(() => {
    if (shouldResetDismissState) {
      trackPushNotificationBannerForceShow();
      dispatch(resetNotificationBannerDismissState());
    }
  }, [dispatch, shouldResetDismissState]);
  React.useEffect(() => {
    trackPushNotificationsBannerVisualized(MESSAGES_ROUTES.MESSAGES_HOME);
  }, []);

  const dismissionCount = useIOSelector(
    timesPushNotificationBannerDismissedSelector
  );
  const discardModal = usePushNotificationsBannerBottomSheet(closeHandler);

  const onClose = () => {
    trackPushNotificationsBannerClosure();
    if (dismissionCount >= 2) {
      trackPushNotificationBannerDismissAlert();
      discardModal.present();
    } else {
      dispatch(setUserDismissedNotificationsBanner());
      closeHandler();
    }
  };

  const onPress = React.useCallback(() => {
    trackPushNotificationsBannerTap(MESSAGES_ROUTES.MESSAGES_HOME);
    openSystemNotificationSettingsScreen();
  }, []);

  return (
    <View style={styles.margins} testID="pushnotif-bannerContainer">
      <Banner
        testID="pushNotificationsBanner"
        title={I18n.t("features.messages.pushNotifications.banner.title")}
        content={I18n.t("features.messages.pushNotifications.banner.body")}
        action={I18n.t("features.messages.pushNotifications.banner.CTA")}
        pictogramName="notification"
        color="turquoise"
        size="big"
        onClose={onClose}
        labelClose={I18n.t("global.buttons.close")}
        onPress={onPress}
      />
      {discardModal.bottomSheet}
    </View>
  );
};

const usePushNotificationsBannerBottomSheet = (
  remindLaterHandler: () => void
) => {
  const dispatch = useIODispatch();

  const internalRemindLaterHandler = () => {
    trackPushNotificationBannerDismissOutcome("remind_later");
    remindLaterHandler();
  };

  const fullCloseHandler = () => {
    trackPushNotificationBannerDismissOutcome("deactivate");
    dispatch(setPushNotificationBannerForceDismissed());
  };

  return useIOBottomSheetModal({
    title: I18n.t(
      "features.messages.pushNotifications.banner.bottomSheet.title"
    ),
    footer: (
      <FooterActions
        actions={{
          type: "TwoButtons",
          primary: {
            label: I18n.t(
              "features.messages.pushNotifications.banner.bottomSheet.cta"
            ),
            onPress: internalRemindLaterHandler
          },
          secondary: {
            label: I18n.t(
              "features.messages.pushNotifications.banner.bottomSheet.cta2"
            ),
            onPress: fullCloseHandler
          }
        }}
      />
    ),
    component: (
      <Body>
        {I18n.t("features.messages.pushNotifications.banner.bottomSheet.body")}
      </Body>
    ),
    snapPoint: [300]
  });
};
const styles = StyleSheet.create({
  margins: {
    marginHorizontal: IOVisualCostants.appMarginDefault,
    marginVertical: 16
  }
});
