import React from "react";
import { Image, View, StyleSheet } from "react-native";
import NotificationsBackground from "../../../../img/onboarding/notifications_background.svg";
import NotificationsBackgroundBlue from "../../../../img/onboarding/notifications_background_blue.svg";
import { H4 } from "../../../components/core/typography/H4";
import { H5 } from "../../../components/core/typography/H5";
import { IOColors } from "../../../components/core/variables/IOColors";
import customVariables from "../../../theme/variables";
import I18n from "../../../i18n";
import { TranslationKeys } from "../../../../locales/locales";

const backgroundImageHeight = 200;
const notificationHeight = 72;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IOColors.white,
    // justifyContent: "flex-start",
    alignItems: "center",
    height: backgroundImageHeight
  },
  blue: {
    backgroundColor: IOColors.blue
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  overlay: {
    width: "90%",
    minHeight: notificationHeight,
    backgroundColor: IOColors.white,
    borderRadius: customVariables.borderRadiusBase,
    borderWidth: 1,
    borderColor: IOColors.bluegreyLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start"
  },

  previewNotificationMargin: {
    bottom: 60
  },

  overlayWhiteBg: {
    backgroundColor: IOColors.white // Modify the background color for the white background style
  },
  overlayImage: {
    width: 25,
    height: 25,
    marginRight: "5%",
    marginLeft: "3%",
    borderRadius: customVariables.borderRadiusBase
  },

  overlayText: {
    flexDirection: "column"
  }
});

type Props = {
  previewEnabled: boolean;
  remindersEnabled: boolean;
  isFirstOnboarding: boolean;
};

const computeTitleAndMessageKeys = (
  isPreviewEnabled: boolean,
  areRemindersEnabled: boolean
): { titleKey: TranslationKeys; messageKey: TranslationKeys } => {
  if (isPreviewEnabled && areRemindersEnabled) {
    return {
      titleKey:
        "onboarding.notifications.preview.reminderOnPreviewOnTitle" as TranslationKeys,
      messageKey:
        "onboarding.notifications.preview.reminderOnPreviewOnMessage" as TranslationKeys
    };
  } else if (isPreviewEnabled && !areRemindersEnabled) {
    return {
      titleKey:
        "onboarding.notifications.preview.reminderOffPreviewOnTitle" as TranslationKeys,
      messageKey:
        "onboarding.notifications.preview.reminderOffPreviewOnMessage" as TranslationKeys
    };
  } else if (!isPreviewEnabled && areRemindersEnabled) {
    return {
      titleKey:
        "onboarding.notifications.preview.reminderOnPreviewOffTitle" as TranslationKeys,
      messageKey:
        "onboarding.notifications.preview.reminderOnPreviewOffMessage" as TranslationKeys
    };
  }

  return {
    titleKey:
      "onboarding.notifications.preview.reminderOffPreviewOffTitle" as TranslationKeys,
    messageKey:
      "onboarding.notifications.preview.reminderOffPreviewOffMessage" as TranslationKeys
  };
};

export const NotificationsPreferencesPreview = ({
  previewEnabled,
  remindersEnabled,
  isFirstOnboarding
}: Props) => {
  const { titleKey, messageKey } = computeTitleAndMessageKeys(
    previewEnabled,
    remindersEnabled
  );

  return (
    <View style={[styles.container, !isFirstOnboarding && styles.blue]}>
      {isFirstOnboarding ? (
        <NotificationsBackground />
      ) : (
        <NotificationsBackgroundBlue />
      )}

      <View style={styles.overlayContainer}>
        <View
          style={[
            styles.overlay,
            styles.previewNotificationMargin,
            isFirstOnboarding && styles.overlayWhiteBg
          ]}
        >
          <Image
            source={require("../../../../img/onboarding/notification_icon.png")}
            style={styles.overlayImage}
          />
          <View style={styles.overlayText}>
            <H4 weight="SemiBold" color="bluegreyDark">
              {I18n.t(titleKey)}
            </H4>
            <H5 weight="Regular" color="bluegrey">
              {I18n.t(messageKey)}
            </H5>
          </View>
        </View>
      </View>
    </View>
  );
};
