import { useCallback, useRef } from "react";
import { View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Alert } from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { preferredCalendarSelector } from "../../../../store/reducers/persistedPreferences";
import { useMessageReminder } from "../../hooks/useMessageReminder";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { formatDateAsShortFormat } from "../../../../utils/dates";

type MessageDetailsReminderExpiringProps = {
  dueDate: Date;
  messageId: string;
  title: string;
};

export const MessageDetailsReminderExpiring = ({
  dueDate,
  messageId,
  title
}: MessageDetailsReminderExpiringProps) => {
  const navigation = useIONavigation();
  const alertRef = useRef<View>(null);
  const didShowCalendarModalRef = useRef<boolean>(false);
  const preferredCalendar = useIOSelector(preferredCalendarSelector);

  const navigate = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    didShowCalendarModalRef.current = true;
    navigation.navigate("MESSAGES_NAVIGATOR", {
      screen: "MESSAGE_DETAIL_CALENDAR",
      params: {
        messageId
      }
    });
  }, [messageId, navigation]);

  // When going back from the calendar-selection modal, the
  // accessibility focus is stolen by the back button so we
  // have to do this customization to make sure that the
  // focus goes back to the Alert component
  useFocusEffect(
    useCallback(() => {
      if (didShowCalendarModalRef.current) {
        // eslint-disable-next-line functional/immutable-data
        didShowCalendarModalRef.current = false;
        // 1000 is a safe delay on low spec Android devices. Lower
        // values will not prevent the back button to steal focus
        setAccessibilityFocus(alertRef, 1000 as Millisecond);
      }
    }, [didShowCalendarModalRef])
  );

  const { isEventInDeviceCalendar, upsertReminder } = useMessageReminder(
    messageId,
    navigate
  );
  return (
    <Alert
      testID="due-date-alert"
      variant="warning"
      ref={alertRef}
      action={
        isEventInDeviceCalendar
          ? I18n.t("features.messages.alert.removeReminder")
          : I18n.t("features.messages.alert.addReminder")
      }
      onPress={() => upsertReminder(dueDate, title, preferredCalendar)}
      content={I18n.t("features.messages.alert.content", {
        date: formatDateAsShortFormat(dueDate),
        time: new Intl.DateTimeFormat("it", {
          hour: "2-digit",
          minute: "2-digit"
        }).format(dueDate)
      })}
    />
  );
};
