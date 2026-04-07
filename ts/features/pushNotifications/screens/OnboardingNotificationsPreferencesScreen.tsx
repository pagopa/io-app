import {
  Body,
  ContentWrapper,
  H1,
  IOButton,
  IOStyles,
  useIOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PushNotificationsContentTypeEnum } from "../../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../definitions/backend/ReminderStatus";
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
  const safeAreaInsets = useSafeAreaInsets();
  const toast = useIOToast();

  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
      <View
        style={[
          IOStyles.footer,
          {
            paddingBottom: safeAreaInsets.bottom + IOStyles.footer.paddingBottom
          }
        ]}
      >
        <IOButton
          fullWidth
          label={I18n.t("onboarding.notifications.continue")}
          loading={isUpdating}
          onPress={upsertPreferences}
          variant="solid"
        />
      </View>
    </>
  );
};
