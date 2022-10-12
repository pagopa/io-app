import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CompatNavigationProp } from "@react-navigation/compat";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { PreferencesListItem } from "../../components/PreferencesListItem";
import ScreenContent from "../../components/screens/ScreenContent";
import I18n from "../../i18n";
import { profileRemindersPreferenceSelector } from "../../store/reducers/profile";
import { useIODispatch } from "../../store/hooks";
import { profileUpsert } from "../../store/actions/profile";
import { ReminderStatusEnum } from "../../../definitions/backend/ReminderStatus";
import { showToast } from "../../utils/showToast";
import { IOStackNavigationProp } from "../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../navigation/params/OnboardingParamsList";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import Switch from "../../components/ui/Switch";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { BlockButtonProps } from "../../components/ui/BlockButtons";
import { InfoBox } from "../../components/box/InfoBox";
import { IOColors } from "../../components/core/variables/IOColors";
import { H5 } from "../../components/core/typography/H5";
import customVariables from "../../theme/variables";
import { IOBadge } from "../../components/core/IOBadge";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import { NotificationsPreferencesPreview } from "./components/NotificationsPreferencesPreview";

const styles = StyleSheet.create({
  separator: {
    backgroundColor: customVariables.itemSeparator,
    height: StyleSheet.hairlineWidth
  },
  bottomSpacer: {
    marginBottom: customVariables.spacerLargeHeight
  },
  darkBg: {
    backgroundColor: IOColors.blue
  },
  containerActions: {
    backgroundColor: IOColors.white,
    borderRadius: 16,
    height: "100%",
    flexGrow: 1,
    padding: customVariables.contentPadding,
    paddingTop: 0
  },
  badge: {
    padding: customVariables.contentPadding / 2
  }
});

export type OnboardingNotificationsPreferencesScreenNavigationParams = {
  isFirstOnboarding: boolean;
};

type Props = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<
      OnboardingParamsList,
      "ONBOARDING_NOTIFICATIONS_PREFERENCES"
    >
  >;
};

const continueButtonProps = (
  isLoading: boolean,
  onPress: () => void
): BlockButtonProps => ({
  block: true,
  onPress,
  title: I18n.t("onboarding.notifications.continue"),
  isLoading
});

const loadingButtonProps = (): BlockButtonProps => ({
  block: true,
  onPress: undefined,
  title: "",
  disabled: true,
  style: { backgroundColor: IOColors.greyLight, width: "100%" },
  isLoading: true,
  iconColor: IOColors.bluegreyDark
});

const CustomGoBack = memo(
  ({ isFirstOnboarding }: { isFirstOnboarding: boolean }) => (
    <View style={styles.badge}>
      {!isFirstOnboarding && (
        <IOBadge
          text={I18n.t("onboarding.notifications.badge")}
          labelColor={"bluegreyDark"}
        />
      )}
    </View>
  )
);

const OnboardingNotificationsPreferencesScreen = (props: Props) => {
  const dispatch = useIODispatch();

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [isUpserting, setIsUpserting] = useState(false);

  const remindersPreference = useSelector(profileRemindersPreferenceSelector);

  const isError = pot.isError(remindersPreference);
  const isUpdating = pot.isUpdating(remindersPreference);

  const isFirstOnboarding = props.navigation.getParam("isFirstOnboarding");

  useEffect(() => {
    if (isError && isUpserting) {
      showToast(I18n.t("profile.preferences.notifications.error"));
    }
    if (!isUpdating) {
      setIsUpserting(false);
    }
  }, [isError, isUpdating, isUpserting]);

  const upsertPreferences = () => {
    setIsUpserting(true);
    dispatch(
      profileUpsert.request({
        reminder_status: remindersEnabled
          ? ReminderStatusEnum.ENABLED
          : ReminderStatusEnum.DISABLED
      })
    );
  };

  return (
    <BaseScreenComponent
      customGoBack={<CustomGoBack isFirstOnboarding={isFirstOnboarding} />}
      headerTitle={
        isFirstOnboarding
          ? I18n.t("onboarding.notifications.headerTitle")
          : undefined
      }
      contextualHelp={emptyContextualHelp}
      primary={!isFirstOnboarding}
    >
      <ScreenContent
        hideHeader={true}
        {...(!isFirstOnboarding && {
          contentStyle: styles.darkBg
        })}
      >
        <ScreenContentHeader
          title={I18n.t(
            isFirstOnboarding
              ? "profile.preferences.notifications.titleNewUser"
              : "profile.preferences.notifications.title"
          )}
          subtitle={I18n.t(
            isFirstOnboarding
              ? "profile.preferences.notifications.subtitleNewUser"
              : "profile.preferences.notifications.subtitle"
          )}
          {...(!isFirstOnboarding && {
            dark: true,
            contentStyle: styles.darkBg
          })}
        />
        <NotificationsPreferencesPreview
          remindersEnabled={remindersEnabled}
          isFirstOnboarding={isFirstOnboarding}
        />
        <View style={styles.containerActions}>
          <View style={styles.separator} />
          <PreferencesListItem
            title={I18n.t("profile.preferences.notifications.reminders.title")}
            description={I18n.t(
              "profile.preferences.notifications.reminders.description"
            )}
            rightElement={
              <Switch
                value={remindersEnabled}
                onValueChange={setRemindersEnabled}
                disabled={isUpdating}
              />
            }
          />
          <View style={[styles.separator, styles.bottomSpacer]} />
          <InfoBox iconName={"io-profilo"} iconColor={IOColors.bluegrey}>
            <H5 color={"bluegrey"} weight={"Regular"}>
              {I18n.t("profile.main.privacy.shareData.screen.profileSettings")}
            </H5>
          </InfoBox>
        </View>
      </ScreenContent>
      <SafeAreaView>
        <FooterWithButtons
          type="SingleButton"
          leftButton={
            isUpdating
              ? loadingButtonProps()
              : continueButtonProps(isUpdating, upsertPreferences)
          }
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default OnboardingNotificationsPreferencesScreen;
