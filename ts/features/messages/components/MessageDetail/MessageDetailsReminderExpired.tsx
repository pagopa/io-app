import React from "react";
import { Alert } from "@pagopa/io-app-design-system";
import { localeDateFormat } from "../../../../utils/locale";
import I18n from "../../../../i18n";

type MessageDetailsReminderExpiredProps = {
  dueDate: Date;
  isLoading: boolean;
};

export const MessageDetailsReminderExpired = ({
  dueDate,
  isLoading
}: MessageDetailsReminderExpiredProps) => (
  <Alert
    action={isLoading ? " " : undefined}
    onPress={() => undefined}
    isLoading={isLoading}
    testID="due-date-alert"
    variant="warning"
    content={I18n.t("features.messages.badge.dueDate", {
      date: localeDateFormat(
        dueDate,
        I18n.t("global.dateFormats.dayMonthWithoutTime")
      ),
      time: localeDateFormat(dueDate, I18n.t("global.dateFormats.timeFormat"))
    })}
  />
);
