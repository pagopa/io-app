import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { memo, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { PushNotificationsContentTypeEnum } from "../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../definitions/backend/ReminderStatus";
import { InfoBox } from "../../components/box/InfoBox";
import { IOBadge } from "../../components/core/IOBadge";
import { Body } from "../../components/core/typography/Body";
import { H1 } from "../../components/core/typography/H1";
import { H5 } from "../../components/core/typography/H5";
import { IOColors } from "../../components/core/variables/IOColors";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { PreferencesListItem } from "../../components/PreferencesListItem";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import { BlockButtonProps } from "../../components/ui/BlockButtons";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import Switch from "../../components/ui/Switch";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../navigation/params/OnboardingParamsList";
import { profileUpsert } from "../../store/actions/profile";
import { useIODispatch } from "../../store/hooks";
import { profilePreferencesSelector } from "../../store/reducers/profile";
import customVariables from "../../theme/variables";
import { usePreviewMoreInfo } from "../../utils/hooks/usePreviewMoreInfo";
import { showToast } from "../../utils/showToast";
import { NotificationsPreferencesPreview } from "./components/NotificationsPreferencesPreview";

const styles = StyleSheet.create({
  contentHeader: {
    padding: customVariables.contentPadding,
    paddingTop: 0
  },
  separator: {
    backgroundColor: customVariables.itemSeparator,
    height: StyleSheet.hairlineWidth
  },
  bottomSpacer: {
    marginBottom: customVariables.spacerLargeHeight
  },
  blueBg: {
    backgroundColor: IOColors.blue
  },
  containerActions: {
    backgroundColor: IOColors.white,
    borderRadius: 16,
    height: "100%",
    paddingLeft: customVariables.contentPadding,
    paddingRight: customVariables.contentPadding,
    paddingBottom: customVariables.contentPadding
  },
  containerActionsBlueBg: {
    paddingTop: customVariables.contentPadding
  },
  badge: {
    padding: customVariables.contentPadding / 2
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.notifications.contextualHelpTitle",
  body: "onboarding.notifications.contextualHelpContent"
};

export type OnboardingNotificationsPreferencesScreenNavigationParams = {
  isFirstOnboarding: boolean;
};

type Props = IOStackNavigationRouteProps<
  OnboardingParamsList,
  "ONBOARDING_NOTIFICATIONS_PREFERENCES"
>;

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

const Header = memo(({ isFirstOnboarding }: { isFirstOnboarding: boolean }) => {
  const { title, subtitle } = isFirstOnboarding
    ? {
        title: I18n.t("profile.preferences.notifications.title"),
        subtitle: I18n.t("profile.preferences.notifications.subtitle")
      }
    : {
        title: I18n.t("profile.preferences.notifications.titleExistingUser"),
        subtitle: I18n.t(
          "profile.preferences.notifications.subtitleExistingUser"
        )
      };

  return (
    <View style={styles.contentHeader}>
      <H1 color={isFirstOnboarding ? "bluegreyDark" : "white"}>{title}</H1>
      <Body color={isFirstOnboarding ? "bluegreyDark" : "white"}>
        {subtitle}
      </Body>
    </View>
  );
});

const OnboardingNotificationsPreferencesScreen = (props: Props) => {
  const dispatch = useIODispatch();

  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const preferences = useSelector(profilePreferencesSelector);
  const { present, bottomSheet } = usePreviewMoreInfo();

  const isError = pot.isError(preferences);
  const isUpdating = pot.isUpdating(preferences);

  const { isFirstOnboarding } = props.route.params;

  useEffect(() => {
    if (isError && !isUpdating) {
      showToast(I18n.t("profile.preferences.notifications.error"));
    }
  }, [isError, isUpdating]);

  const upsertPreferences = () => {
    dispatch(
      profileUpsert.request({
        reminder_status: remindersEnabled
          ? ReminderStatusEnum.ENABLED
          : ReminderStatusEnum.DISABLED,
        push_notifications_content_type: previewEnabled
          ? PushNotificationsContentTypeEnum.FULL
          : PushNotificationsContentTypeEnum.ANONYMOUS
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
      contextualHelpMarkdown={contextualHelpMarkdown}
      primary={!isFirstOnboarding}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={!isFirstOnboarding && styles.blueBg}>
          <Header isFirstOnboarding={isFirstOnboarding} />
          <NotificationsPreferencesPreview
            previewEnabled={previewEnabled}
            remindersEnabled={remindersEnabled}
            isFirstOnboarding={isFirstOnboarding}
          />
          <View
            style={[
              styles.containerActions,
              !isFirstOnboarding && styles.containerActionsBlueBg
            ]}
          >
            {isFirstOnboarding && <View style={styles.separator} />}
            <PreferencesListItem
              title={I18n.t("profile.preferences.notifications.preview.title")}
              description={`${I18n.t(
                "profile.preferences.notifications.preview.description"
              )} `}
              moreInfo={{
                moreInfoText: I18n.t(
                  "profile.preferences.notifications.preview.link"
                ),
                moreInfoTap: present
              }}
              rightElement={
                <Switch
                  value={previewEnabled}
                  onValueChange={setPreviewEnabled}
                  disabled={isUpdating}
                  testID="previewsPreferenceSwitch"
                />
              }
            />
            <View style={styles.separator} />
            <PreferencesListItem
              title={I18n.t(
                "profile.preferences.notifications.reminders.title"
              )}
              description={I18n.t(
                "profile.preferences.notifications.reminders.description"
              )}
              rightElement={
                <Switch
                  value={remindersEnabled}
                  onValueChange={setRemindersEnabled}
                  disabled={isUpdating}
                  testID="remindersPreferenceSwitch"
                />
              }
            />
            <View style={[styles.separator, styles.bottomSpacer]} />
            <InfoBox iconName={"io-profilo"} iconColor={IOColors.bluegrey}>
              <H5 color={"bluegrey"} weight={"Regular"}>
                {I18n.t(
                  "profile.main.privacy.shareData.screen.profileSettings"
                )}
              </H5>
            </InfoBox>
          </View>
        </ScrollView>

        {bottomSheet}
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
