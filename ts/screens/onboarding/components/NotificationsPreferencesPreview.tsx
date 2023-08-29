import React from "react";
import { StyleSheet, ImageBackground } from "react-native";
import NotificationBlueBg from "../../../../img/onboarding/notification_blue.png";
import NotificationWhiteBg from "../../../../img/onboarding/notification_white.png";
import { NotificationPreviewSample } from "./NotificationPreviewSample";

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    minHeight: 200
  }
});

type Props = {
  previewEnabled: boolean;
  remindersEnabled: boolean;
  isFirstOnboarding: boolean;
};

export const NotificationsPreferencesPreview = ({
  previewEnabled,
  remindersEnabled,
  isFirstOnboarding
}: Props) => (
  <ImageBackground
    source={isFirstOnboarding ? NotificationWhiteBg : NotificationBlueBg}
    resizeMode="contain"
    style={styles.container}
  >
    <NotificationPreviewSample
      previewEnabled={previewEnabled}
      remindersEnabled={remindersEnabled}
    />
  </ImageBackground>
);
