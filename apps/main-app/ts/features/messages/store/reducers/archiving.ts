import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import {
  resetMessageArchivingAction,
  interruptMessageArchivingProcessingAction,
  removeScheduledMessageArchivingAction,
  startProcessingMessageArchivingAction,
  toggleScheduledMessageArchivingAction
} from "../actions/archiving";
import { duplicateSetAndRemove, duplicateSetAndToggle } from "../../utils";
import { GlobalState } from "../../../../store/reducers/types";
import { MessageListCategory } from "../../types/messageListCategory";

export type ArchivingStatus = "disabled" | "enabled" | "processing";

export type ProcessingResult = {
  type: "success" | "error";
  reason: string;
};

export type Archiving = {
  fromArchiveToInbox: Set<string>;
  fromInboxToArchive: Set<string>;
  processingResult: ProcessingResult | undefined;
  status: ArchivingStatus;
};

export const INITIAL_STATE: Archiving = {
  fromArchiveToInbox: new Set<string>(),
  fromInboxToArchive: new Set<string>(),
  processingResult: undefined,
  status: "disabled"
};

export const archivingReducer = (
  state: Archiving = INITIAL_STATE,
  action: Action
): Archiving => {
  switch (action.type) {
    case getType(toggleScheduledMessageArchivingAction): {
      if (state.status === "processing") {
        return state;
      }

      const stateDirection = action.payload.fromInboxToArchive
        ? "fromInboxToArchive"
        : "fromArchiveToInbox";
      return {
        ...state,
        status: "enabled",
        [stateDirection]: duplicateSetAndToggle(
          state[stateDirection],
          action.payload.messageId
        )
      };
    }
    case getType(resetMessageArchivingAction): {
      return { ...INITIAL_STATE, processingResult: action.payload };
    }
    case getType(startProcessingMessageArchivingAction): {
      return {
        ...state,
        processingResult: undefined,
        status: "processing"
      };
    }
    case getType(removeScheduledMessageArchivingAction): {
      const stateDirection = action.payload.fromInboxToArchive
        ? "fromInboxToArchive"
        : "fromArchiveToInbox";
      return {
        ...state,
        [stateDirection]: duplicateSetAndRemove(
          state[stateDirection],
          action.payload.messageId
        )
      };
    }
    case getType(interruptMessageArchivingProcessingAction): {
      if (state.status === "processing") {
        return {
          ...state,
          processingResult: action.payload,
          status: "enabled"
        };
      }
      return state;
    }
    default: {
      return state;
    }
  }
};

export const isArchivingDisabledSelector = (state: GlobalState) =>
  state.entities.messages.archiving.status === "disabled";
export const isArchivingInSchedulingModeSelector = (state: GlobalState) =>
  state.entities.messages.archiving.status === "enabled";
export const isArchivingInProcessingModeSelector = (state: GlobalState) =>
  state.entities.messages.archiving.status === "processing";
export const isMessageScheduledForArchivingSelector = (
  state: GlobalState,
  messageId: string
) => {
  const archiving = state.entities.messages.archiving;
  if (archiving.status === "disabled") {
    return false;
  }

  const isScheduledForArchiving =
    archiving.fromInboxToArchive.has(messageId) ||
    archiving.fromArchiveToInbox.has(messageId);

  return isScheduledForArchiving;
};
export const areThereEntriesForShownMessageListCategorySelector = (
  state: GlobalState,
  category: MessageListCategory
) => {
  const archiving = state.entities.messages.archiving;
  const scheduledMessageSet =
    category === "ARCHIVE"
      ? archiving.fromArchiveToInbox
      : archiving.fromInboxToArchive;

  return scheduledMessageSet.size > 0;
};
export const nextQueuedMessageDataUncachedSelector = (state: GlobalState) => {
  const archiving = state.entities.messages.archiving;

  if (archiving.fromInboxToArchive.size > 0) {
    const messageIds = [...archiving.fromInboxToArchive];
    return {
      messageId: messageIds[0],
      archiving: true
    };
  } else if (archiving.fromArchiveToInbox.size > 0) {
    const messageIds = [...archiving.fromArchiveToInbox];
    return {
      messageId: messageIds[0],
      archiving: false
    };
  }
  return undefined;
};
export const processingResultTypeSelector = (state: GlobalState) =>
  state.entities.messages.archiving.processingResult?.type;
export const processingResultReasonSelector = (state: GlobalState) =>
  state.entities.messages.archiving.processingResult?.reason;
