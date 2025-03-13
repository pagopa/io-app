import { Alert, IOAlertRadius, IOSkeleton } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { localeDateFormat } from "../../../../utils/locale";

type MessageDetailsReminderExpiredProps = {
  dueDate: Date;
  isLoading: boolean;
};

export const MessageDetailsReminderExpired = ({
  dueDate,
  isLoading
}: MessageDetailsReminderExpiredProps) =>
  isLoading ? (
    <IOSkeleton
      shape="rectangle"
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
