import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { useEffect, useState } from "react";
import { List } from "native-base";
import { useSelector } from "react-redux";
import { PreferencesListItem } from "../../components/PreferencesListItem";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import { RemoteSwitch } from "../../components/core/selection/RemoteSwitch";
import { profileRemindersPreferenceSelector } from "../../store/reducers/profile";
import { useIODispatch } from "../../store/hooks";
import { profileUpsert } from "../../store/actions/profile";
import { ReminderStatusEnum } from "../../../definitions/backend/ReminderStatus";
import { showToast } from "../../utils/showToast";

export const NotificationsPreferencesScreen = () => {
  const dispatch = useIODispatch();
  const [isUpserting, setIsUpserting] = useState(false);

  const remindersPreference = useSelector(profileRemindersPreferenceSelector);

  const isError = pot.isError(remindersPreference);
  const isUpdating = pot.isUpdating(remindersPreference);

  useEffect(() => {
    if (isError && isUpserting) {
      showToast(I18n.t("profile.preferences.notifications.error"));
    }
    if (!isUpdating) {
      setIsUpserting(false);
    }
  }, [isError, isUpdating, isUpserting]);

  const toggleRemindersPreference = (isEnabled: boolean) => {
    setIsUpserting(true);
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
          <PreferencesListItem
            title={I18n.t("profile.preferences.notifications.reminders.title")}
            description={I18n.t(
              "profile.preferences.notifications.reminders.description"
            )}
            rightElement={
              <RemoteSwitch
                value={remindersPreference}
                onValueChange={toggleRemindersPreference}
                testID="remindersPreferenceSwitch"
              ></RemoteSwitch>
            }
          />
        </List>
      </ScreenContent>
    </TopScreenComponent>
  );
};
