import { useCallback } from "react";
import { Alert } from "@pagopa/io-app-design-system";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { preferredCalendarSelector } from "../../../../store/reducers/persistedPreferences";
import { UIMessageId } from "../../types";
import { useMessageReminder } from "../../hooks/useMessageReminder";
import { localeDateFormat } from "../../../../utils/locale";
import I18n from "../../../../i18n";

type MessageDetailsReminderExpiringProps = {
  dueDate: Date;
  messageId: UIMessageId;
  title: string;
};

export const MessageDetailsReminderExpiring = ({
  dueDate,
  messageId,
  title
}: MessageDetailsReminderExpiringProps) => {
  const navigation = useIONavigation();
  const preferredCalendar = useIOSelector(preferredCalendarSelector);

  const navigate = useCallback(() => {
    navigation.navigate("MESSAGES_NAVIGATOR", {
      screen: "MESSAGE_DETAIL_CALENDAR",
      params: {
        messageId
      }
    });
  }, [messageId, navigation]);

  const { isEventInDeviceCalendar, upsertReminder } = useMessageReminder(
    messageId,
    navigate
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
