import { createStandardAction } from "typesafe-actions";
import { ProcessingResult } from "../reducers/archiving";

type ScheduleMessageArchivingType = {
  fromInboxToArchive: boolean;
  messageId: string;
};

export const toggleScheduledMessageArchivingAction = createStandardAction(
  "TOGGLE_SCHEDULED_MESSAGE_ARCHIVING"
)<ScheduleMessageArchivingType>();

export const removeScheduledMessageArchivingAction = createStandardAction(
  "REMOVE_SCHEDULED_MESSAGE_ARCHIVING"
)<ScheduleMessageArchivingType>();

export const resetMessageArchivingAction = createStandardAction(
  "RESET_MESSAGE_ARCHIVING_SCHEDULE"
)<ProcessingResult | undefined>();

export const startProcessingMessageArchivingAction = createStandardAction(
  "START_PROCESSING_MESSAGE_ARCHIVING_ACTION"
)<void>();
export const interruptMessageArchivingProcessingAction = createStandardAction(
  "INTERRUPT_MESSAGE_ARCHIVING_PROCESSING"
)<ProcessingResult | undefined>();
