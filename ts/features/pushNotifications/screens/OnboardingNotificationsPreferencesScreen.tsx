import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Divider,
  VSpacer,
  ContentWrapper,
  IOStyles,
  ButtonSolid,
  ListItemSwitch,
  FeatureInfo,
  useIOToast,
  H1,
  Body
} from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PushNotificationsContentTypeEnum } from "../../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../definitions/backend/ReminderStatus";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../../navigation/params/OnboardingParamsList";
import { profileUpsert } from "../../../store/actions/profile";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { profilePreferencesSelector } from "../../../store/reducers/profile";
import { usePreviewMoreInfo } from "../hooks/usePreviewMoreInfo";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { getFlowType } from "../../../utils/analytics";
import {
  trackNotificationPreferenceConfiguration,
  trackNotificationScreen,
  trackNotificationsPreferencesPreviewStatus,
  trackNotificationsPreferencesReminderStatus
} from "../../../screens/profile/analytics";
import { NotificationsPreferencesPreview } from "../components/NotificationsPreferencesPreview";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1
  }
});

export type OnboardingNotificationsPreferencesScreenNavigationParams = {
  isFirstOnboarding: boolean;
};

type Props = IOStackNavigationRouteProps<
  OnboardingParamsList,
  "ONBOARDING_NOTIFICATIONS_PREFERENCES"
>;

export const OnboardingNotificationsPreferencesScreen = (props: Props) => {
  const dispatch = useIODispatch();
  const safeAreaInsets = useSafeAreaInsets();
  const toast = useIOToast();

  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const preferences = useIOSelector(profilePreferencesSelector);
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
      toast.error(I18n.t("profile.preferences.notifications.error"));
    }
  }, [isError, isUpdating, toast]);

  const store = useIOStore();

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

  useHeaderSecondLevel({
    canGoBack: false,
    supportRequest: true,
    title: ""
  });

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <ContentWrapper>
          <H1>{I18n.t("profile.preferences.notifications.title")}</H1>
          <VSpacer size={16} />
          <Body>{I18n.t("profile.preferences.notifications.subtitle")}</Body>
          <VSpacer size={24} />
          <NotificationsPreferencesPreview
            previewEnabled={previewEnabled}
            remindersEnabled={remindersEnabled}
          />
          <VSpacer size={24} />
          <ListItemSwitch
            label={I18n.t("profile.preferences.notifications.preview.title")}
            description={I18n.t(
              "profile.preferences.notifications.preview.description"
            )}
            action={{
              label: I18n.t("profile.preferences.notifications.preview.link"),
              onPress: present
            }}
            value={previewEnabled}
            disabled={isUpdating}
            onSwitchValueChange={setPreviewEnabled}
          />
          <Divider />
          <ListItemSwitch
            label={I18n.t("profile.preferences.notifications.reminders.title")}
            description={I18n.t(
              "profile.preferences.notifications.reminders.description"
            )}
            value={remindersEnabled}
            disabled={isUpdating}
            onSwitchValueChange={setRemindersEnabled}
          />
          <VSpacer size={40} />
          <FeatureInfo
            iconName="navProfile"
            body={I18n.t(
              "profile.main.privacy.shareData.screen.profileSettings"
            )}
          />
          <VSpacer size={32} />
        </ContentWrapper>
      </ScrollView>
      <View
        style={[
          IOStyles.footer,
          {
            paddingBottom: safeAreaInsets.bottom + IOStyles.footer.paddingBottom
          }
        ]}
      >
        <ButtonSolid
          fullWidth
          loading={isUpdating}
          label={I18n.t("onboarding.notifications.continue")}
          onPress={upsertPreferences}
        />
      </View>
      {bottomSheet}
    </>
  );
};
