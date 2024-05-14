import {
  ContentWrapper,
  Divider,
  FooterWithButtons,
  IOColors,
  IOToast,
  IOVisualCostants,
  NativeSwitch,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as B from "fp-ts/lib/boolean";
import { pipe } from "fp-ts/lib/function";
import React, { memo, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { useSelector, useStore } from "react-redux";
import { PushNotificationsContentTypeEnum } from "../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../definitions/backend/ReminderStatus";
import { PreferencesListItem } from "../../components/PreferencesListItem";
import { InfoBox } from "../../components/box/InfoBox";
import { IOBadge } from "../../components/core/IOBadge";
import { Body } from "../../components/core/typography/Body";
import { H1 } from "../../components/core/typography/H1";
import { H5 } from "../../components/core/typography/H5";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../navigation/params/OnboardingParamsList";
import { profileUpsert } from "../../store/actions/profile";
import { useIODispatch } from "../../store/hooks";
import { profilePreferencesSelector } from "../../store/reducers/profile";
import customVariables from "../../theme/variables";
import { getFlowType } from "../../utils/analytics";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { usePreviewMoreInfo } from "../../utils/hooks/usePreviewMoreInfo";
import {
  trackNotificationPreferenceConfiguration,
  trackNotificationScreen,
  trackNotificationsPreferencesPreviewStatus,
  trackNotificationsPreferencesReminderStatus
} from "../profile/analytics";
import { NotificationsPreferencesPreview } from "./components/NotificationsPreferencesPreview";

const styles = StyleSheet.create({
  containerActions: {
    backgroundColor: IOColors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    paddingBottom: customVariables.contentPadding
  },
  containerActionsBlueBg: {
    paddingTop: customVariables.contentPadding
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

const CustomGoBack = memo(
  ({ isFirstOnboarding }: { isFirstOnboarding: boolean }) =>
    pipe(
      isFirstOnboarding,
      B.fold(
        () => (
          <IOBadge
            text={I18n.t("onboarding.notifications.badge")}
            variant="solid"
            color="aqua"
          />
        ),
        () => null
      )
    )
);

const Header = memo(({ isFirstOnboarding }: { isFirstOnboarding: boolean }) => {
  const { title, subtitle } = pipe(
    isFirstOnboarding,
    B.fold(
      () => ({
        title: I18n.t("profile.preferences.notifications.titleExistingUser"),
        subtitle: I18n.t(
          "profile.preferences.notifications.subtitleExistingUser"
        )
      }),
      () => ({
        title: I18n.t("profile.preferences.notifications.title"),
        subtitle: I18n.t("profile.preferences.notifications.subtitle")
      })
    )
  );

  return (
    <ContentWrapper>
      <H1 color={isFirstOnboarding ? "bluegreyDark" : "white"}>{title}</H1>
      <Body color={isFirstOnboarding ? "bluegreyDark" : "white"}>
        {subtitle}
      </Body>
      <VSpacer size={24} />
    </ContentWrapper>
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

  useOnFirstRender(() => {
    trackNotificationScreen(getFlowType(true, isFirstOnboarding));
  });

  useEffect(() => {
    trackNotificationsPreferencesPreviewStatus(
      previewEnabled,
      getFlowType(true, isFirstOnboarding)
    );
  }, [isFirstOnboarding, previewEnabled]);

  useEffect(() => {
    trackNotificationsPreferencesReminderStatus(
      remindersEnabled,
      getFlowType(true, isFirstOnboarding)
    );
  }, [isFirstOnboarding, remindersEnabled]);

  useEffect(() => {
    if (isError && !isUpdating) {
      IOToast.error(I18n.t("profile.preferences.notifications.error"));
    }
  }, [isError, isUpdating]);

  const store = useStore();

  const upsertPreferences = () => {
    void trackNotificationPreferenceConfiguration(
      remindersEnabled,
      previewEnabled,
      getFlowType(true, isFirstOnboarding),
      store.getState()
    );
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
        <ScrollView
          style={{
            backgroundColor: !isFirstOnboarding ? IOColors.blue : IOColors.white
          }}
          contentContainerStyle={{
            flexGrow: 1
          }}
        >
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
            {isFirstOnboarding && <Divider />}
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
                <NativeSwitch
                  value={previewEnabled}
                  onValueChange={setPreviewEnabled}
                  disabled={isUpdating}
                  testID="previewsPreferenceSwitch"
                />
              }
            />
            <Divider />
            <PreferencesListItem
              title={I18n.t(
                "profile.preferences.notifications.reminders.title"
              )}
              description={I18n.t(
                "profile.preferences.notifications.reminders.description"
              )}
              rightElement={
                <NativeSwitch
                  value={remindersEnabled}
                  onValueChange={setRemindersEnabled}
                  disabled={isUpdating}
                  testID="remindersPreferenceSwitch"
                />
              }
            />
            <Divider />
            <VSpacer size={24} />
            <InfoBox iconName="navProfile" iconColor="bluegrey">
              <H5 color={"bluegrey"} weight={"Regular"}>
                {I18n.t(
                  "profile.main.privacy.shareData.screen.profileSettings"
                )}
              </H5>
            </InfoBox>
          </View>
          {/* This extra View has been added to avoid displaying the IOColors.blue
          background when the ScrollView bounces  */}
          <View
            style={{
              position: "absolute",
              height: 400,
              left: 0,
              right: 0,
              bottom: -400,
              backgroundColor: IOColors.white
            }}
          />
        </ScrollView>

        {bottomSheet}
      </SafeAreaView>
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Solid",
          buttonProps: {
            label: I18n.t("onboarding.notifications.continue"),
            accessibilityLabel: I18n.t("onboarding.notifications.continue"),
            onPress: upsertPreferences,
            loading: isUpdating
          }
        }}
      />
    </BaseScreenComponent>
  );
};

export default OnboardingNotificationsPreferencesScreen;
