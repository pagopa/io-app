import React from "react";
import { View, StyleSheet } from "react-native";
import NotificationsBackground from "../../../../img/onboarding/notifications_background.svg";
import NotificationsBackgroundBlue from "../../../../img/onboarding/notifications_background_blue.svg";
import { H4 } from "../../../components/core/typography/H4";
import { H5 } from "../../../components/core/typography/H5";
import { IOColors } from "../../../components/core/variables/IOColors";
import customVariables from "../../../theme/variables";
import AppLogo from "../../../../img/app-logo.svg";
import I18n from "../../../i18n";

const backgroundImageHeight = 200;
const notificationHeight = 72;

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors.white,
    justifyContent: "center",
    alignItems: "center",
    height: backgroundImageHeight
  },
  blue: {
    backgroundColor: IOColors.blue
  },
  notification: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    position: "absolute",
    backgroundColor: IOColors.white,
    left: customVariables.contentPadding,
    right: customVariables.contentPadding,
    borderRadius: customVariables.borderRadiusBase,
    padding: 16,
    minHeight: notificationHeight
  },
  notificationWhiteBg: {
    borderWidth: 1,
    borderColor: IOColors.bluegreyLight
  },
  box: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  info: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 16
  }
});

type Props = {
  remindersEnabled: boolean;
  isFirstOnboarding: boolean;
};

export const NotificationsPreferencesPreview = ({
  remindersEnabled,
  isFirstOnboarding
}: Props) => {
  const title = remindersEnabled
    ? I18n.t("onboarding.notifications.remindersPreviewTitle")
    : I18n.t("onboarding.notifications.previewTitle");
  const message = I18n.t("onboarding.notifications.previewMessage");

  return (
    <View style={[styles.container, !isFirstOnboarding && styles.blue]}>
      {isFirstOnboarding ? (
        <NotificationsBackground />
      ) : (
        <NotificationsBackgroundBlue />
      )}
      <View
        style={[
          styles.notification,
          isFirstOnboarding && styles.notificationWhiteBg
        ]}
      >
        <View style={styles.box}>
          <AppLogo style={{ width: 24, height: 24 }} />
          <View style={styles.info}>
            <H4 weight="SemiBold" color="bluegreyDark">
              {title}
            </H4>
            <H5 weight={"Regular"} color={"bluegrey"}>
              {message}
            </H5>
          </View>
        </View>
      </View>
    </View>
  );
};
