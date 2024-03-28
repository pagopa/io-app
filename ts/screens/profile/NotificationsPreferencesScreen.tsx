import { ContentWrapper, IOToast } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PushNotificationsContentTypeEnum } from "../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../definitions/backend/ReminderStatus";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";
import { PreferencesListItem } from "../../components/PreferencesListItem";
import { RemoteSwitch } from "../../components/core/selection/RemoteSwitch";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../i18n";
import { profileUpsert } from "../../store/actions/profile";
import { useIODispatch } from "../../store/hooks";
import { profilePreferencesSelector } from "../../store/reducers/profile";
import { getFlowType } from "../../utils/analytics";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { usePreviewMoreInfo } from "../../utils/hooks/usePreviewMoreInfo";
import {
  trackNotificationScreen,
  trackNotificationsPreferencesPreviewStatus,
  trackNotificationsPreferencesReminderStatus
} from "./analytics";

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

  useOnFirstRender(() => {
    trackNotificationScreen(getFlowType(false, false));
  });

  useEffect(() => {
    if (isError && isUpserting) {
      IOToast.error(I18n.t("profile.preferences.notifications.error"));
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
    <RNavScreenWithLargeHeader
      title={{
        label: I18n.t("profile.preferences.notifications.header")
      }}
      description={I18n.t("profile.preferences.notifications.subtitle")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      headerActionsProp={{ showHelp: true }}
    >
      <ContentWrapper>
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
                trackNotificationsPreferencesPreviewStatus(
                  value,
                  getFlowType(false, false)
                );
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
                trackNotificationsPreferencesReminderStatus(
                  value,
                  getFlowType(false, false)
                );
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
      </ContentWrapper>
      {bottomSheet}
    </RNavScreenWithLargeHeader>
  );
};
