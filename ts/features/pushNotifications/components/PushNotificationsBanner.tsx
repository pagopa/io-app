import {
  Banner,
  Body,
  FooterActions,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import {
  trackPushNotificationBannerDismissAlert,
  trackPushNotificationBannerDismissOutcome,
  trackPushNotificationBannerForceShow,
  trackPushNotificationsBannerClosure,
  trackPushNotificationsBannerTap,
  trackPushNotificationsBannerVisualized
} from "../analytics";
import {
  resetNotificationBannerDismissState,
  setPushNotificationBannerForceDismissed,
  setUserDismissedNotificationsBanner
} from "../store/actions/userBehaviour";
import {
  shouldResetNotificationBannerDismissStateSelector,
  timesPushNotificationBannerDismissedSelector
} from "../store/selectors/notificationsBannerDismissed";
import { openSystemNotificationSettingsScreen } from "../utils";
type Props = {
  closeHandler: () => void;
};

export const PushNotificationsBanner = ({ closeHandler }: Props) => {
  const route = useRoute();
  const dispatch = useIODispatch();
  const shouldResetDismissState = useIOSelector(
    shouldResetNotificationBannerDismissStateSelector
  );

  useEffect(() => {
    if (shouldResetDismissState) {
      trackPushNotificationBannerForceShow();
      dispatch(resetNotificationBannerDismissState());
    }
  }, [dispatch, shouldResetDismissState]);

  useEffect(() => {
    trackPushNotificationsBannerVisualized(route.name);
  }, [route.name]);

  const dismissionCount = useIOSelector(
    timesPushNotificationBannerDismissedSelector
  );
  const discardModal = usePushNotificationsBannerBottomSheet(closeHandler);

  const onClose = () => {
    trackPushNotificationsBannerClosure(route.name);
    if (dismissionCount >= 2) {
      trackPushNotificationBannerDismissAlert();
      discardModal.present();
    } else {
      dispatch(setUserDismissedNotificationsBanner());
      closeHandler();
    }
  };

  const onPress = useCallback(() => {
    trackPushNotificationsBannerTap(route.name);
    openSystemNotificationSettingsScreen();
  }, [route.name]);

  return (
    <View style={styles.margins} testID="pushnotif-bannerContainer">
      <Banner
        testID="pushNotificationsBanner"
        title={I18n.t("features.messages.pushNotifications.banner.title")}
        content={I18n.t("features.messages.pushNotifications.banner.body")}
        action={I18n.t("features.messages.pushNotifications.banner.CTA")}
        pictogramName="notification"
        color="turquoise"
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
