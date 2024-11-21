import { Banner, IOVisualCostants } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import I18n from "../../../i18n";
import { openSystemNotificationSettingsScreen } from "../utils";
type Props = {
  closeHandler: () => void;
};

export const PushNotificationsBanner = ({ closeHandler }: Props) => (
  <View style={styles.margins} testID="pushnotif-bannerContainer">
    <Banner
      testID="pushNotificationsBanner"
      title={I18n.t("features.messages.pushNotifications.banner.title")}
      content={I18n.t("features.messages.pushNotifications.banner.body")}
      action={I18n.t("features.messages.pushNotifications.banner.CTA")}
      pictogramName="notification"
      color="turquoise"
      size="big"
      onClose={closeHandler}
      labelClose={I18n.t("global.buttons.close")}
      onPress={openSystemNotificationSettingsScreen}
    />
  </View>
);
const styles = StyleSheet.create({
  margins: {
    marginHorizontal: IOVisualCostants.appMarginDefault,
    marginVertical: 16
  }
});
