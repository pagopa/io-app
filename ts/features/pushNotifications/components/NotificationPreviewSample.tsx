import {
  H6,
  HSpacer,
  IOColors,
  IOSpacingScale,
  Icon,
  BodySmall,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { TranslationKeys } from "../../../../locales/locales";

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

const computeTitleAndMessageKeys = (
  isPreviewEnabled: boolean,
  areRemindersEnabled: boolean
): Record<"titleKey" | "messageKey", TranslationKeys> => {
  if (isPreviewEnabled && areRemindersEnabled) {
    return {
      titleKey: "onboarding.notifications.preview.reminderOnPreviewOnTitle",
      messageKey: "onboarding.notifications.preview.reminderOnPreviewOnMessage"
    };
  } else if (isPreviewEnabled && !areRemindersEnabled) {
    return {
      titleKey: "onboarding.notifications.preview.reminderOffPreviewOnTitle",
      messageKey: "onboarding.notifications.preview.reminderOffPreviewOnMessage"
    };
  } else if (!isPreviewEnabled && areRemindersEnabled) {
    return {
      titleKey: "onboarding.notifications.preview.reminderOnPreviewOffTitle",
      messageKey: "onboarding.notifications.preview.reminderOnPreviewOffMessage"
    };
  }

  return {
    titleKey: "onboarding.notifications.preview.reminderOffPreviewOffTitle",
    messageKey: "onboarding.notifications.preview.reminderOffPreviewOffMessage"
  };
};

export const NotificationPreviewSample = ({
  previewEnabled,
  remindersEnabled
}: Props) => {
  const { titleKey, messageKey } = computeTitleAndMessageKeys(
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
      <Icon size={24} name="productIOAppBlueBg" />
      <HSpacer />
      <View style={{ flex: 1 }}>
        <H6>{I18n.t(titleKey as any)}</H6>
        <BodySmall weight="Regular">{I18n.t(messageKey as any)}</BodySmall>
      </View>
    </View>
  );
};
