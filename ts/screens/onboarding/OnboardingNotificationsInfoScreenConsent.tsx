import React, { memo, useEffect } from "react";
import { AppState, SafeAreaView, StyleSheet, View } from "react-native";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import I18n from "../../i18n";
import { IOStyles } from "../../components/core/variables/IOStyles";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { BlockButtonProps } from "../../components/ui/BlockButtons";
import { openAppSettings } from "../../utils/appSettings";
import { useIODispatch } from "../../store/hooks";
import { notificationsInfoScreenConsent } from "../../store/actions/notifications";
import NotificationsIcon from "../../../img/onboarding/ios-notifications-icon.svg";
import NotificationsToggleIcon from "../../../img/onboarding/ios-notifications-toggle-icon.svg";
import customVariables from "../../theme/variables";
import { H4 } from "../../components/core/typography/H4";
import { checkNotificationPermissions } from "../../utils/notification";

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
  primary: true
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
    dispatch(notificationsInfoScreenConsent());
  };

  const openSettings = () => {
    openAppSettings();
  };

  return (
    <BaseScreenComponent
      headerTitle={I18n.t("onboarding.infoConsent.headerTitle")}
      contextualHelp={emptyContextualHelp}
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
        <FooterWithButtons
          type="TwoButtonsVertical"
          leftButton={settingsButtonProps(false, openSettings)}
          rightButton={continueButtonProps(false, goNext)}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default OnboardingNotificationsInfoScreenConsent;
