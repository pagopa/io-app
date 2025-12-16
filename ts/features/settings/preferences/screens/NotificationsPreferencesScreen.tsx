import { useCallback, useEffect, useState } from "react";
import { ContentWrapper, useIOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { PushNotificationsContentTypeEnum } from "../../../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../../definitions/backend/ReminderStatus";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { profileUpsert } from "../../common/store/actions";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  profileHasErrorSelector,
  profileIsUpdatingSelector,
  pushNotificationPreviewEnabledSelector,
  pushNotificationRemindersEnabledSelector
} from "../../common/store/selectors";
import { getFlowType } from "../../../../utils/analytics";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { ProfileNotificationSettings } from "../../../pushNotifications/components/ProfileNotificationsSettings";
import {
  trackNotificationScreen,
  trackNotificationsPreferencesPreviewStatus,
  trackNotificationsPreferencesReminderStatus
} from "../../common/analytics";

export const NotificationsPreferencesScreen = () => {
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const [isUpsertingPreview, setIsUpsertingPreview] = useState(false);
  const [isUpsertingReminders, setIsUpsertingReminders] = useState(false);

  const profileHasError = useIOSelector(profileHasErrorSelector);
  const profileIsUpdating = useIOSelector(profileIsUpdatingSelector);
  const previewSwitchIsOn = useIOSelector(
    pushNotificationPreviewEnabledSelector
  );
  const remindersSwitchIsOn = useIOSelector(
    pushNotificationRemindersEnabledSelector
  );

  useOnFirstRender(() => {
    trackNotificationScreen(getFlowType(false, false));
  });

  useEffect(() => {
    if (profileHasError && (isUpsertingPreview || isUpsertingReminders)) {
      toast.error(I18n.t("profile.preferences.notifications.error"));
    }
    if (!profileIsUpdating) {
      if (isUpsertingPreview) {
        setIsUpsertingPreview(false);
      }
      if (isUpsertingReminders) {
        setIsUpsertingReminders(false);
      }
    }
  }, [
    isUpsertingPreview,
    isUpsertingReminders,
    profileHasError,
    profileIsUpdating,
    toast
  ]);

  const onPreviewValueChanged = useCallback(
    (isPreviewEnabled: boolean) => {
      trackNotificationsPreferencesPreviewStatus(
        isPreviewEnabled,
        getFlowType(false, false)
      );
      setIsUpsertingPreview(true);
      dispatch(
        profileUpsert.request({
          push_notifications_content_type: isPreviewEnabled
            ? PushNotificationsContentTypeEnum.FULL
            : PushNotificationsContentTypeEnum.ANONYMOUS
        })
      );
    },
    [dispatch]
  );

  const onReminderValueChanged = useCallback(
    (isReminderEnabled: boolean) => {
      trackNotificationsPreferencesReminderStatus(
        isReminderEnabled,
        getFlowType(false, false)
      );
      setIsUpsertingReminders(true);
      dispatch(
        profileUpsert.request({
          reminder_status: isReminderEnabled
            ? ReminderStatusEnum.ENABLED
            : ReminderStatusEnum.DISABLED
        })
      );
    },
    [dispatch]
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("profile.preferences.notifications.title")
      }}
      description={I18n.t("profile.preferences.notifications.subtitle")}
      headerActionsProp={{ showHelp: true }}
    >
      <ContentWrapper>
        <ProfileNotificationSettings
          disablePreviewSetting={profileIsUpdating}
          disableRemindersSetting={profileIsUpdating}
          isUpdatingPreviewSetting={isUpsertingPreview}
          isUpdatingRemindersSetting={isUpsertingReminders}
          onPreviewValueChanged={onPreviewValueChanged}
          onReminderValueChanged={onReminderValueChanged}
          showSettingsPath={false}
          previewSwitchValue={previewSwitchIsOn}
          remindersSwitchValue={remindersSwitchIsOn}
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
