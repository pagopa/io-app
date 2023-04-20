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
      <View
        style={[
          styles.notification,
          isFirstOnboarding && styles.notificationWhiteBg
        ]}
        accessible={true}
        accessibilityLabel={`${I18n.t(
          "onboarding.notifications.preview.accessibilityLabelPrefix"
        )} ${I18n.t(titleKey)} ${I18n.t(messageKey)}`}
      >
        <View
          style={styles.box}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden={true}
        >
          <Image
            source={require("../../../../img/onboarding/notification_icon.png")}
          />
          <View style={styles.info}>
            <H4 weight="SemiBold" color="bluegreyDark">
              {I18n.t(titleKey)}
            </H4>
            <H5 weight={"Regular"} color={"bluegrey"}>
              {I18n.t(messageKey)}
            </H5>
          </View>
        </View>
      </View>
    </View>
  );
};
