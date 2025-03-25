import { Alert, VSpacer } from "@pagopa/io-app-design-system";
import { UIMessageId } from "../../types";
import { localeDateFormat } from "../../../../utils/locale";
import I18n from "../../../../i18n";
import { MessageDetailsReminderExpiring } from "./MessageDetailsReminderExpiring";

export type MessageDetailsReminderProps = {
  dueDate?: Date;
  messageId: UIMessageId;
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
            date: localeDateFormat(
              dueDate,
              I18n.t("global.dateFormats.dayMonthWithoutTime")
            ),
            time: localeDateFormat(
              dueDate,
              I18n.t("global.dateFormats.timeFormat")
            )
          })}
        />
      )}
      <VSpacer size={16} />
    </>
  );
};
