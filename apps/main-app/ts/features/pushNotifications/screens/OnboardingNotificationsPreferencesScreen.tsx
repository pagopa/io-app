import { PushNotificationsContentTypeEnum } from "@io-app/api-types/generated/definitions/identity/PushNotificationsContentType";
import { ReminderStatusEnum } from "@io-app/api-types/generated/definitions/identity/ReminderStatus";
import {
  Body,
  ContentWrapper,
  FooterActions,
  FooterActionsMeasurements,
  H1,
  useIOToast,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";

import { useHardwareBackButton } from "../../../hooks/useHardwareBackButton";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { getFlowType } from "../../../utils/analytics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { OnboardingParamsList } from "../../onboarding/navigation/params/OnboardingParamsList";
import {
  trackNotificationPreferenceConfiguration,
  trackNotificationScreen,
  trackNotificationsPreferencesPreviewStatus,
  trackNotificationsPreferencesReminderStatus
} from "../../settings/common/analytics";
import { profileUpsert } from "../../settings/common/store/actions";
import {
  profileHasErrorSelector,
  profileIsUpdatingSelector
} from "../../settings/common/store/selectors";
import { ProfileNotificationSettings } from "../components/ProfileNotificationsSettings";

export type OnboardingNotificationsPreferencesScreenNavigationParams = {
  isFirstOnboarding: boolean;
};

type Props = IOStackNavigationRouteProps<
  OnboardingParamsList,
  "ONBOARDING_NOTIFICATIONS_PREFERENCES"
>;

export const OnboardingNotificationsPreferencesScreen = (props: Props) => {
  const dispatch = useIODispatch();
  const toast = useIOToast();

  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [footerActionsMeasurements, setFooterActionsMeasurements] =
    useState<FooterActionsMeasurements>({
      actionBlockHeight: 0,
      safeBottomAreaHeight: 0
    });

  const isError = useIOSelector(profileHasErrorSelector);
  const isUpdating = useIOSelector(profileIsUpdatingSelector);

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

  useHardwareBackButton(() => true);

  useHeaderSecondLevel({
    canGoBack: false,
    supportRequest: true,
    title: ""
  });

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
        }}
      >
        <ContentWrapper>
          <H1 accessibilityRole="header">
            {I18n.t("profile.preferences.notifications.title")}
          </H1>
          <VSpacer size={16} />
          <Body>{I18n.t("profile.preferences.notifications.subtitle")}</Body>
          <ProfileNotificationSettings
            disablePreviewSetting={isUpdating}
            disableRemindersSetting={isUpdating}
            isUpdatingPreviewSetting={isUpdating}
            isUpdatingRemindersSetting={isUpdating}
            onPreviewValueChanged={setPreviewEnabled}
            onReminderValueChanged={setRemindersEnabled}
            previewSwitchValue={previewEnabled}
            remindersSwitchValue={remindersEnabled}
            showSettingsPath
          />
        </ContentWrapper>
      </ScrollView>
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t("onboarding.notifications.continue"),
            loading: isUpdating,
            onPress: upsertPreferences
          }
        }}
        onMeasure={setFooterActionsMeasurements}
      />
    </>
  );
};
