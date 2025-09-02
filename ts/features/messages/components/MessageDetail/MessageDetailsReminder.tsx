import { Alert, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { MessageDetailsReminderExpiring } from "./MessageDetailsReminderExpiring";

export type MessageDetailsReminderProps = {
  dueDate?: Date;
  messageId: string;
  title: string;
};

export const MessageDetailsReminder = ({
  dueDate,
  messageId,
  title
}: MessageDetailsReminderProps) => {
  if (dueDate == null) {
    return null;
  }

  const isExpiring = dueDate > new Date();
  return (
    <>
      {isExpiring ? (
        <MessageDetailsReminderExpiring
          dueDate={dueDate}
          messageId={messageId}
          title={title}
        />
      ) : (
        <Alert
          testID="due-date-alert"
          variant="warning"
          content={I18n.t("features.messages.badge.dueDate", {
            date: new Intl.DateTimeFormat("it", {
              day: "2-digit",
              month: "short"
            }).format(dueDate),
            time: new Intl.DateTimeFormat("it", {
              hour: "2-digit",
              minute: "2-digit"
            }).format(dueDate)
          })}
        />
      )}
      <VSpacer size={16} />
    </>
  );
};
