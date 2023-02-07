import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { useEffect, useState } from "react";
import { List } from "native-base";
import { useSelector } from "react-redux";
import { PreferencesListItem } from "../../components/PreferencesListItem";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import { RemoteSwitch } from "../../components/core/selection/RemoteSwitch";
import { profilePreferencesSelector } from "../../store/reducers/profile";
import { useIODispatch } from "../../store/hooks";
import { profileUpsert } from "../../store/actions/profile";
import { ReminderStatusEnum } from "../../../definitions/backend/ReminderStatus";
import { PushNotificationsContentTypeEnum } from "../../../definitions/backend/PushNotificationsContentType";
import { showToast } from "../../utils/showToast";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";
import { usePreviewMoreInfo } from "../../utils/hooks/usePreviewMoreInfo";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import {
  trackNotificationsPreferencesPreviewStatus,
  trackNotificationsPreferencesReminderStatus
} from "../../utils/analytics";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.notifications.contextualHelpTitle",
  body: "profile.preferences.notifications.contextualHelpContent"
};

export const NotificationsPreferencesScreen = () => {
  const dispatch = useIODispatch();
  const [isUpserting, setIsUpserting] = useState(false);
  const preferences = useSelector(profilePreferencesSelector);

  const reminder = pot.map(preferences, p => p.reminder);
  const preview = pot.map(preferences, p => p.preview);
  const isError = pot.isError(preferences);
  const isUpdating = pot.isUpdating(preferences);

  const { present, bottomSheet } = usePreviewMoreInfo();

  useEffect(() => {
    if (isError && isUpserting) {
      showToast(I18n.t("profile.preferences.notifications.error"));
    }
    if (!isUpdating) {
      setIsUpserting(false);
    }
  }, [isError, isUpdating, isUpserting]);

  const togglePreference = <T,>(type: string, value: T) => {
    setIsUpserting(true);
    dispatch(profileUpsert.request({ [type]: value }));
  };

  return (
    <TopScreenComponent
      goBack={true}
      headerTitle={I18n.t("profile.preferences.notifications.header")}
      contextualHelpMarkdown={contextualHelpMarkdown}
    >
      <ScreenContent
        title={I18n.t("profile.preferences.notifications.title")}
        subtitle={I18n.t("profile.preferences.notifications.subtitle")}
      >
        <List withContentLateralPadding={true}>
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
              <RemoteSwitch
                value={preview}
                accessibilityLabel={`${I18n.t(
                  "profile.preferences.notifications.preview.title"
                )}. ${I18n.t(
                  "profile.preferences.notifications.preview.description"
                )}`}
                onValueChange={(value: boolean) => {
                  trackNotificationsPreferencesPreviewStatus(value);
                  togglePreference<PushNotificationsContentTypeEnum>(
                    "push_notifications_content_type",
                    value
                      ? PushNotificationsContentTypeEnum.FULL
                      : PushNotificationsContentTypeEnum.ANONYMOUS
                  );
                }}
                testID="previewPreferenceSwitch"
              />
            }
          />
          <ItemSeparatorComponent noPadded={true} />
          <PreferencesListItem
            title={I18n.t("profile.preferences.notifications.reminders.title")}
            description={I18n.t(
              "profile.preferences.notifications.reminders.description"
            )}
            rightElement={
              <RemoteSwitch
                value={reminder}
                accessibilityLabel={`${I18n.t(
                  "profile.preferences.notifications.reminders.title"
                )}. ${I18n.t(
                  "profile.preferences.notifications.reminders.description"
                )}`}
                onValueChange={(value: boolean) => {
                  trackNotificationsPreferencesReminderStatus(value);
                  togglePreference<ReminderStatusEnum>(
                    "reminder_status",
                    value
                      ? ReminderStatusEnum.ENABLED
                      : ReminderStatusEnum.DISABLED
                  );
                }}
                testID="remindersPreferenceSwitch"
              />
            }
          />
          <ItemSeparatorComponent noPadded={true} />
        </List>
        {bottomSheet}
      </ScreenContent>
    </TopScreenComponent>
  );
};
