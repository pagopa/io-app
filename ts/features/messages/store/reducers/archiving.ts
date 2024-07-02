import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { UIMessageId } from "../../types";
import { cancelMessageArchivingScheduleAction, toggleScheduledMessageArchivingAction } from "../actions/archiving";
import { duplicateSetAndToggle } from "../../utils";
import { GlobalState } from "../../../../store/reducers/types";

type ArchivingStatus = "disabled" | "enabled" | "processing";

export type Archiving = {
  status: ArchivingStatus;
  fromInboxToArchive: Set<UIMessageId>;
  fromArchiveToInbox: Set<UIMessageId>;
};

const INITIAL_STATE: Archiving = {
  status: "disabled",
  fromInboxToArchive: new Set<UIMessageId>,
  fromArchiveToInbox: new Set<UIMessageId>
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
      const messageId = action.payload.messageId;
      return action.payload.fromInboxToArchive ? {
          ...state,
          status: "enabled",
          fromInboxToArchive: duplicateSetAndToggle(state.fromInboxToArchive, messageId)
        } : {
          ...state,
          status: "enabled",
          fromArchiveToInbox: duplicateSetAndToggle(state.fromArchiveToInbox, messageId)
        };
    }
    case getType(cancelMessageArchivingScheduleAction): {
      return INITIAL_STATE;
    }
  }
  return state;
};

export const showArchiveRestoreBarSelector = (state: GlobalState) => state.entities.messages.archiving.status !== "disabled";

