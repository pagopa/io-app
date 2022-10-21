import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { useEffect, useState } from "react";
import { List } from "native-base";
import { StyleSheet } from "react-native";
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
import { Link } from "../../components/core/typography/Link";
import customVariables from "../../theme/variables";
import { useIOBottomSheetModal } from "../../utils/hooks/bottomSheet";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { Body } from "../../components/core/typography/Body";

const styles = StyleSheet.create({
  mediumText: {
    fontSize: customVariables.fontSizeSmall,
    lineHeight: customVariables.h5LineHeight
  }
});

export const NotificationsPreferencesScreen = () => {
  const dispatch = useIODispatch();
  const [isUpserting, setIsUpserting] = useState(false);

  const remindersPreference = useSelector(profileRemindersPreferenceSelector);

  const isError = pot.isError(remindersPreference);
  const isUpdating = pot.isUpdating(remindersPreference);

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <Body>
      {I18n.t("profile.preferences.notifications.preview.bottomSheet.content")}
    </Body>,
    I18n.t("profile.preferences.notifications.preview.bottomSheet.title"),
    400,
    <FooterWithButtons
      type="SingleButton"
      leftButton={{
        block: true,
        primary: true,
        onPress: () => dismiss(),
        title: I18n.t(
          "profile.preferences.notifications.preview.bottomSheet.cta"
        )
      }}
    />
  );

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
    >
      <ScreenContent
        title={I18n.t("profile.preferences.notifications.title")}
        subtitle={I18n.t("profile.preferences.notifications.subtitle")}
      >
        <List withContentLateralPadding={true}>
          <PreferencesListItem
            title={I18n.t("profile.preferences.notifications.preview.title")}
            description={
              <>
                {`${I18n.t(
                  "profile.preferences.notifications.preview.description"
                )} `}
                <Link style={styles.mediumText} onPress={present}>
                  {I18n.t("profile.preferences.notifications.preview.link")}
                </Link>
              </>
            }
            rightElement={
              <RemoteSwitch
                value={remindersPreference}
                onValueChange={(value: boolean) =>
                  togglePreference<ReminderStatusEnum>(
                    "reminder_status",
                    value
                      ? ReminderStatusEnum.ENABLED
                      : ReminderStatusEnum.DISABLED
                  )
                }
                testID="previewPreferenceSwitch"
              />
            }
          />
          <PreferencesListItem
            title={I18n.t("profile.preferences.notifications.reminders.title")}
            description={I18n.t(
              "profile.preferences.notifications.reminders.description"
            )}
            rightElement={
              <RemoteSwitch
                value={remindersPreference}
                onValueChange={(value: boolean) =>
                  togglePreference<ReminderStatusEnum>(
                    "reminder_status",
                    value
                      ? ReminderStatusEnum.ENABLED
                      : ReminderStatusEnum.DISABLED
                  )
                }
                testID="remindersPreferenceSwitch"
              />
            }
          />
        </List>
        {bottomSheet}
      </ScreenContent>
    </TopScreenComponent>
  );
};
