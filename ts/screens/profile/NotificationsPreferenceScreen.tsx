import React from "react";
import { List } from "native-base";
import { useSelector } from "react-redux";
import { PreferenceListItem } from "../../components/PreferenceListItem";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import { RemoteSwitch } from "../../components/core/selection/RemoteSwitch";
import { profileRemindersPreferenceSelector } from "../../store/reducers/profile";
import { useIODispatch } from "../../store/hooks";
import { profileUpsert } from "../../store/actions/profile";
import { ReminderStatusEnum } from "../../../definitions/backend/ReminderStatus";

export const NotificationsPreferenceScreen = () => {
  const dispatch = useIODispatch();

  const remindersPreference = useSelector(profileRemindersPreferenceSelector);

  const toggleRemindersPreference = (isEnabled: boolean) => {
    dispatch(
      profileUpsert.request({
        reminder_status: isEnabled
          ? ReminderStatusEnum.ENABLED
          : ReminderStatusEnum.DISABLED
      })
    );
  };

  return (
    <TopScreenComponent
      goBack={true}
      headerTitle={I18n.t("profile.preferences.notifications.header")}
    >
      <ScreenContent
        title={I18n.t("profile.preferences.notifications.title")}
        subtitle={I18n.t("profile.preferences.notifications.subtitle")}
      >
        <List withContentLateralPadding={true}>
          <PreferenceListItem
            title={I18n.t("profile.preferences.notifications.reminders.title")}
            description={I18n.t(
              "profile.preferences.notifications.reminders.description"
            )}
            rightElement={
              <RemoteSwitch
                value={remindersPreference}
                onValueChange={toggleRemindersPreference}
              ></RemoteSwitch>
            }
          />
        </List>
      </ScreenContent>
    </TopScreenComponent>
  );
};
