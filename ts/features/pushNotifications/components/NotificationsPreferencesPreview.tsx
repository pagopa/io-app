import { StyleSheet, ImageBackground } from "react-native";
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
};

export const NotificationsPreferencesPreview = ({
  previewEnabled,
  remindersEnabled
}: Props) => (
  <ImageBackground
    source={NotificationWhiteBg}
    resizeMode="contain"
    style={styles.container}
  >
    <NotificationPreviewSample
      previewEnabled={previewEnabled}
      remindersEnabled={remindersEnabled}
    />
  </ImageBackground>
);
