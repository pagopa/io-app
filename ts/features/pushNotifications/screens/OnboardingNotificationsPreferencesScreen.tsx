import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  VSpacer,
  ContentWrapper,
  IOStyles,
  useIOToast,
  H1,
  Body,
  IOButton
} from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "i18next";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../onboarding/navigation/params/OnboardingParamsList";
import { profileUpsert } from "../../settings/common/store/actions";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import {
  profileHasErrorSelector,
  profileIsUpdatingSelector
} from "../../settings/common/store/selectors";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { getFlowType } from "../../../utils/analytics";
import {
  trackNotificationPreferenceConfiguration,
  trackNotificationScreen,
  trackNotificationsPreferencesPreviewStatus,
  trackNotificationsPreferencesReminderStatus
} from "../../settings/common/analytics";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useHardwareBackButton } from "../../../hooks/useHardwareBackButton";
import { ProfileNotificationSettings } from "../components/ProfileNotificationsSettings";
import { ReminderStatusEnum } from "../../../../definitions/backend/identity/ReminderStatus";
import { PushNotificationsContentTypeEnum } from "../../../../definitions/backend/identity/PushNotificationsContentType";

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
          variant="solid"
          loading={isUpdating}
          label={I18n.t("onboarding.notifications.continue")}
          onPress={upsertPreferences}
        />
      </View>
    </>
  );
};
