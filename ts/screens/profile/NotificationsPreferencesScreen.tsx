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
import { profilePreferencesSelector } from "../../store/reducers/profile";
import { useIODispatch } from "../../store/hooks";
import { profileUpsert } from "../../store/actions/profile";
import { ReminderStatusEnum } from "../../../definitions/backend/ReminderStatus";
import { PushNotificationsContentTypeEnum } from "../../../definitions/backend/PushNotificationsContentType";
import { showToast } from "../../utils/showToast";
import { Link } from "../../components/core/typography/Link";
import customVariables from "../../theme/variables";
import { useIOBottomSheetModal } from "../../utils/hooks/bottomSheet";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";
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
  const preferences = useSelector(profilePreferencesSelector);

  const reminder = pot.map(preferences, p => p.reminder);
  const preview = pot.map(preferences, p => p.preview);
  const isError = pot.isError(preferences);
  const isUpdating = pot.isUpdating(preferences);

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
      contextualHelpMarkdown={{
        title: "profile.preferences.notifications.contextualHelpTitle",
        body: "profile.preferences.notifications.contextualHelpContent"
      }}
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
                value={preview}
                onValueChange={(value: boolean) =>
                  togglePreference<PushNotificationsContentTypeEnum>(
                    "push_notifications_content_type",
                    value
                      ? PushNotificationsContentTypeEnum.FULL
                      : PushNotificationsContentTypeEnum.ANONYMOUS
                  )
                }
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
          <ItemSeparatorComponent noPadded={true} />
        </List>
        {bottomSheet}
      </ScreenContent>
    </TopScreenComponent>
  );
};
