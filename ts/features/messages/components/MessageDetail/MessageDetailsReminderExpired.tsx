import { Alert, IOAlertRadius } from "@pagopa/io-app-design-system";
import Placeholder from "rn-placeholder";
import { localeDateFormat } from "../../../../utils/locale";
import I18n from "../../../../i18n";

type MessageDetailsReminderExpiredProps = {
  dueDate: Date;
  isLoading: boolean;
};

export const MessageDetailsReminderExpired = ({
  dueDate,
  isLoading
}: MessageDetailsReminderExpiredProps) =>
  isLoading ? (
    <Placeholder.Box
      animate="shine"
      height={84}
      width={"100%"}
      radius={IOAlertRadius}
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
        time: localeDateFormat(dueDate, I18n.t("global.dateFormats.timeFormat"))
      })}
    />
  );
