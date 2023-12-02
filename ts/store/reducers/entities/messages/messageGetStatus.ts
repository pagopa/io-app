import { getType } from "typesafe-actions";
import {
  SuccessGetMessageDataActionType,
  getMessageDataAction,
  resetGetMessageDataAction
} from "../../../../features/messages/actions";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { reloadAllMessages } from "../../../actions/messages";

export type MessageGetStatusType =
  | "idle"
  | "cancelled"
  | "loading"
  | "blocked"
  | "error"
  | "success";
export type MessageGetStatusFailurePhaseType =
  | "none"
  | "paginatedMessage"
  | "messageDetails"
  | "preconditions"
  | "thirdPartyMessageDetails"
  | "readStatusUpdate";

export type MessageGetStatus = {
  failurePhase: MessageGetStatusFailurePhaseType;
  status: MessageGetStatusType;
  successData: SuccessGetMessageDataActionType | undefined;
};

const INITIAL_STATE: MessageGetStatus = {
  failurePhase: "none",
  status: "idle",
  successData: undefined
};

export const messageGetStatusReducer = (
  state: MessageGetStatus = INITIAL_STATE,
  action: Action
): MessageGetStatus => {
  switch (action.type) {
    case getType(getMessageDataAction.request):
      return {
        status: "loading",
        failurePhase: "none",
        successData: undefined
      };
    case getType(getMessageDataAction.cancel):
      return {
        status: "cancelled",
        failurePhase: "none",
        successData: undefined
      };
    case getType(getMessageDataAction.failure):
      return {
        status: action.payload.blockedFromPushNotificationOpt
          ? "blocked"
          : "error",
        failurePhase: action.payload.phase,
        successData: undefined
      };
    case getType(getMessageDataAction.success):
      return {
        status: "success",
        failurePhase: "none",
        successData: action.payload
      };
    case getType(resetGetMessageDataAction):
    case getType(reloadAllMessages.request):
      return INITIAL_STATE;
  }
  return state;
};

export const showSpinnerFromMessageGetStatusSelector = (state: GlobalState) => {
  const messageGetStatus = state.entities.messages.messageGetStatus.status;
  switch (messageGetStatus) {
    case "blocked":
    case "cancelled":
    case "idle":
    case "loading":
    case "success":
      return true;
  }
  return false;
};
export const messageSuccessDataSelector = (state: GlobalState) =>
  state.entities.messages.messageGetStatus.successData;
export const blockedFromPushNotificationSelector = (state: GlobalState) =>
  state.entities.messages.messageGetStatus.status === "blocked";
