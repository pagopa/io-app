import { createStandardAction } from "typesafe-actions";
import { UIMessageId } from "../../types";

type ScheduleMessageArchivingType = {
  fromInboxToArchive: boolean;
  messageId: UIMessageId;
};

export const toggleScheduledMessageArchivingAction = createStandardAction(
  "TOGGLE_SCHEDULED_MESSAGE_ARCHIVING"
)<ScheduleMessageArchivingType>();

// TODO cancel the saga upon receiving this action
export const cancelMessageArchivingScheduleAction = createStandardAction(
  "RESET_MESSAGE_ARCHIVING_SCHEDULE"
)<void>();