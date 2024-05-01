import React from "react";
import { View, StyleSheet } from "react-native";
import {
  IOColors,
  Icon,
  HSpacer,
  IOSpacingScale,
  Label,
  IOStyles
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { TranslationKeys } from "../../../../locales/locales";

const notificationMarginVertical: IOSpacingScale = 4;
const notificationPaddingVertical: IOSpacingScale = 8;
const notificationPaddingHorizontal: IOSpacingScale = 24;

const styles = StyleSheet.create({
  notification: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: IOColors.white,
    borderWidth: 1,
    borderColor: IOColors.bluegreyLight,
    borderRadius: 8,
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

  return (
    <View style={styles.notification}>
      <Icon color="blueIO-450" name="productIOApp" />
      <HSpacer />
      <View style={IOStyles.flex}>
        <Label weight="SemiBold">{I18n.t(titleKey)}</Label>
        <Label fontSize="small" weight="Regular">
          {I18n.t(messageKey)}
        </Label>
      </View>
    </View>
  );
};
