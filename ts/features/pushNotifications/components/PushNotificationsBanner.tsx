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
      dispatch(resetNotificationBannerDismissState());
    }
  }, [dispatch, shouldResetDismissState]);

  const dismissionCount = useIOSelector(
    timesPushNotificationBannerDismissedSelector
  );
  const discardModal = usePushNotificationsBannerBottomSheet(closeHandler);

  const onClose = () => {
    if (dismissionCount >= 2) {
      discardModal.present();
    } else {
      dispatch(setUserDismissedNotificationsBanner());
      closeHandler();
    }
  };

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
        onPress={openSystemNotificationSettingsScreen}
      />
      {discardModal.bottomSheet}
    </View>
  );
};

const usePushNotificationsBannerBottomSheet = (
  remindLaterHandler: () => void
) => {
  const dispatch = useIODispatch();

  const fullCloseHandler = () =>
    dispatch(setPushNotificationBannerForceDismissed());

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
            onPress: remindLaterHandler
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
