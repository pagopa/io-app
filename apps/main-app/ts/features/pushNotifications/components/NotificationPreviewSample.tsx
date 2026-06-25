import {
  BodySmall,
  H6,
  HSpacer,
  Icon,
  IOColors,
  IOSpacingScale,
  useIOTheme
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";

import { TranslationKeys } from "../../../i18n";

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
): Record<"messageKey" | "titleKey", TranslationKeys> => {
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
      <Icon name="productIOAppBlueBg" size={24} />
      <HSpacer />
      <View style={{ flex: 1 }}>
        <H6>{I18n.t(titleKey)}</H6>
        <BodySmall weight="Regular">{I18n.t(messageKey)}</BodySmall>
      </View>
    </View>
  );
};
