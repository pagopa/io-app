import React from "react";
import { View, StyleSheet } from "react-native";
import NotificationsBackground from "../../../../img/onboarding/notifications_background.svg";
import { H4 } from "../../../components/core/typography/H4";
import { H5 } from "../../../components/core/typography/H5";
import { IOColors } from "../../../components/core/variables/IOColors";
import customVariables from "../../../theme/variables";
import AppLogo from "../../../../img/app-logo.svg";
import I18n from "../../../i18n";

const backgroundImageHeight = 200;
const notificationHeight = 72;

const styles = StyleSheet.create({
  backgroundImage: {
    height: backgroundImageHeight,
    justifyContent: "center"
  },
  notification: {
    backgroundColor: IOColors.white,
    width: "100%",
    height: notificationHeight,
    position: "absolute",
    left: customVariables.contentPadding,
    top: (backgroundImageHeight - notificationHeight) / 2,
    borderColor: IOColors.bluegreyLight,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: "center",
    padding: 16
  }
});

type Props = {
  remindersEnabled: boolean;
};

export const NotificationsPreferencesPreview = (props: Props) => {
  const title = props.remindersEnabled
    ? I18n.t("onboarding.notifications.remindersPreviewTitle")
    : I18n.t("onboarding.notifications.previewTitle");
  const message = I18n.t("onboarding.notifications.previewMessage");

  return (
    <>
      <NotificationsBackground style={styles.backgroundImage} />
      <View style={styles.notification}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <AppLogo style={{ width: 24, height: 24 }} />
          <View style={{ flex: 1, flexDirection: "column", marginLeft: 16 }}>
            <H4 weight="SemiBold" color="bluegreyDark">
              {title}
            </H4>
            <H5 weight={"Regular"} color={"bluegrey"}>
              {message}
            </H5>
          </View>
        </View>
      </View>
    </>
  );
};
