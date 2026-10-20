import {
  BodySmall,
  H6,
  HSpacer,
  Icon,
  IOColors,
  IOSpacingScale,
  useIOTheme
} from "@io-app/design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";

const notificationMarginVertical: IOSpacingScale = 4;
const notificationPaddingVertical: IOSpacingScale = 8;
const notificationPaddingHorizontal: IOSpacingScale = 24;

const styles = StyleSheet.create({
  notification: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: "continuous",
    minHeight: 90,
    marginVertical: notificationMarginVertical,
    paddingVertical: notificationPaddingVertical,
    paddingHorizontal: notificationPaddingHorizontal
  }
});

type Props = {
  previewEnabled: boolean;
  remindersEnabled: boolean;
};

const computeTitleAndMessage = (
  isPreviewEnabled: boolean,
  areRemindersEnabled: boolean
): Record<"message" | "title", string> => {
  if (isPreviewEnabled && areRemindersEnabled) {
    return {
      title: I18n.t(
        "onboarding.notifications.preview.reminderOnPreviewOnTitle"
      ),
      message: I18n.t(
        "onboarding.notifications.preview.reminderOnPreviewOnMessage"
      )
    };
  } else if (isPreviewEnabled && !areRemindersEnabled) {
    return {
      title: I18n.t(
        "onboarding.notifications.preview.reminderOffPreviewOnTitle"
      ),
      message: I18n.t(
        "onboarding.notifications.preview.reminderOffPreviewOnMessage"
      )
    };
  } else if (!isPreviewEnabled && areRemindersEnabled) {
    return {
      title: I18n.t(
        "onboarding.notifications.preview.reminderOnPreviewOffTitle"
      ),
      message: I18n.t(
        "onboarding.notifications.preview.reminderOnPreviewOffMessage"
      )
    };
  }

  return {
    title: I18n.t(
      "onboarding.notifications.preview.reminderOffPreviewOffTitle"
    ),
    message: I18n.t(
      "onboarding.notifications.preview.reminderOffPreviewOffMessage"
    )
  };
};

export const NotificationPreviewSample = ({
  previewEnabled,
  remindersEnabled
}: Props) => {
  const { title, message } = computeTitleAndMessage(
    previewEnabled,
    remindersEnabled
  );

  const theme = useIOTheme();

  return (
    <View
      style={[
        styles.notification,
        {
          backgroundColor: IOColors[theme["appBackground-primary"]],
          borderColor: IOColors[theme["cardBorder-default"]]
        }
      ]}
    >
      <Icon name="productIOAppBlueBg" size={24} />
      <HSpacer />
      <View style={{ flex: 1 }}>
        <H6>{title}</H6>
        <BodySmall weight="Regular">{message}</BodySmall>
      </View>
    </View>
  );
};
