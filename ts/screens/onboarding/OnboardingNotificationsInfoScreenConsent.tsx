import React, { memo, useEffect } from "react";
import { AppState, SafeAreaView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import I18n from "../../i18n";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { BlockButtonProps } from "../../components/ui/BlockButtons";
import { FooterStackButton } from "../../features/bonus/bonusVacanze/components/buttons/FooterStackButtons";
import { openAppSettings } from "../../utils/appSettings";
import { useIODispatch } from "../../store/hooks";
import { notificationsInfoScreenConsent } from "../../store/actions/notifications";
import NotificationsIcon from "../../../img/onboarding/ios-notifications-icon.svg";
import NotificationsToggleIcon from "../../../img/onboarding/ios-notifications-toggle-icon.svg";
import customVariables from "../../theme/variables";
import { H4 } from "../../components/core/typography/H4";
import { checkNotificationPermissions } from "../../utils/notification";
import { profilePreferencesSelector } from "../../store/reducers/profile";
import {
  trackConflictingNotificationSettings,
  trackOpenSystemNotificationSettings,
  trackSkipSystemNotificationPermissions
} from "../../utils/analytics";

const styles = StyleSheet.create({
  container: {
    padding: customVariables.contentPadding
  },
  box: {
    alignItems: "center"
  },
  info: {
    marginLeft: 16
  },
  separator: {
    height: 36
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.infoConsent.contextualHelpTitle",
  body: "onboarding.infoConsent.contextualHelpContent"
};

const settingsButtonProps = (
  isLoading: boolean,
  onPress: () => void
): BlockButtonProps => ({
  block: true,
  onPress,
  title: I18n.t("onboarding.infoConsent.openSettings"),
  isLoading,
  bordered: true
});

const continueButtonProps = (
  isLoading: boolean,
  onPress: () => void
): BlockButtonProps => ({
  block: true,
  onPress,
  title: I18n.t("onboarding.infoConsent.continue"),
  isLoading,
  primary: true,
  testID: "continue-btn"
});

const InstructionRow = memo(
  ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <View style={[IOStyles.flex, IOStyles.row, styles.box]}>
      {icon}
      <View style={[IOStyles.flex, IOStyles.column, styles.info]}>
        <H4 weight="Regular" color="black">
          {title}
        </H4>
      </View>
    </View>
  )
);

const OnboardingNotificationsInfoScreenConsent = () => {
  const dispatch = useIODispatch();

  const optInPreferencesPot = useSelector(profilePreferencesSelector);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async nextAppState => {
        if (nextAppState === "active") {
          const authorizationStatus = await checkNotificationPermissions();

          if (authorizationStatus) {
            dispatch(notificationsInfoScreenConsent());
          }
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  const goNext = () => {
    // When this code executes, we know for sure that system notifications permissions are disabled,
    // otherwise the component would either have been skipped by the saga or it would have automatically
    // handled the given permission using the AppState listener (registered on the useEffect)
    trackSkipSystemNotificationPermissions();

    if (pot.isSome(optInPreferencesPot)) {
      const optInPreferences = optInPreferencesPot.value;
      if (optInPreferences.preview || optInPreferences.reminder) {
        trackConflictingNotificationSettings();
      }
    }

    dispatch(notificationsInfoScreenConsent());
  };

  const openSettings = () => {
    trackOpenSystemNotificationSettings();
    openAppSettings();
  };

  return (
    <BaseScreenComponent
      headerTitle={I18n.t("onboarding.infoConsent.headerTitle")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      goBack={false}
      customGoBack={<View />}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScreenContent
          title={I18n.t("onboarding.infoConsent.title")}
          subtitle={I18n.t("onboarding.infoConsent.subTitle")}
        >
          <View style={styles.container}>
            <InstructionRow
              icon={<NotificationsIcon width={44} height={44} />}
              title={I18n.t("onboarding.infoConsent.instruction1")}
            />
            <View style={styles.separator} />
            <InstructionRow
              icon={<NotificationsToggleIcon width={44} height={23} />}
              title={I18n.t("onboarding.infoConsent.instruction2")}
            />
          </View>
        </ScreenContent>
        <FooterStackButton
          buttons={[
            settingsButtonProps(false, openSettings),
            continueButtonProps(false, goNext)
          ]}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default OnboardingNotificationsInfoScreenConsent;
