import React from "react";
import { Alert } from "@pagopa/io-app-design-system";
import { UIMessageId } from "../../types";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import I18n from "../../../../i18n";
import { localeDateFormat } from "../../../../utils/locale";
import { useIOSelector } from "../../../../store/hooks";
import { useMessageReminder } from "../../hooks/useMessageReminder";
import { preferredCalendarSelector } from "../../../../store/reducers/persistedPreferences";

export type MessageDetailsReminderProps = {
  dueDate: Date;
  messageId: UIMessageId;
  title: string;
};

export const MessageDetailsReminder = ({
  dueDate,
  messageId,
  title
}: MessageDetailsReminderProps) => {
  const navigation = useIONavigation();

  const preferredCalendar = useIOSelector(preferredCalendarSelector);

  const { isEventInDeviceCalendar, upsertReminder } = useMessageReminder(
    messageId,
    () => {
      navigation.navigate("MESSAGES_NAVIGATOR", {
        screen: "MESSAGE_DETAIL_CALENDAR",
        params: {
          messageId
        }
      });
    }
  );

  return (
    <Alert
      testID="due-date-alert"
      variant="warning"
      action={
        isEventInDeviceCalendar
          ? I18n.t("features.messages.alert.removeReminder")
          : I18n.t("features.messages.alert.addReminder")
      }
      onPress={() => upsertReminder(dueDate, title, preferredCalendar)}
      content={I18n.t("features.messages.alert.content", {
        date: localeDateFormat(
          dueDate,
          I18n.t("global.dateFormats.shortFormat")
        ),
        time: localeDateFormat(dueDate, I18n.t("global.dateFormats.timeFormat"))
      })}
    />
  );
};
